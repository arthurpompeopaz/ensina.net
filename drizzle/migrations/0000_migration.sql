
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('membro','vendedor','admin');
CREATE TYPE public.status_profissional AS ENUM ('empregado','desempregado','buscando_emprego','freelancer');
CREATE TYPE public.product_type AS ENUM ('curso','pesquisa','ebook','material_didatico','mentoria');
CREATE TYPE public.order_status AS ENUM ('pendente','pago','reembolsado','cancelado');
CREATE TYPE public.payment_method AS ENUM ('pix','cartao');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_.-]{3,30}$'),
  nome text NOT NULL DEFAULT '',
  avatar_url text,
  bio text CHECK (char_length(bio) <= 2000),
  formacao text,
  area_atuacao text,
  cidade text,
  estado text CHECK (estado IS NULL OR char_length(estado) = 2),
  link_lattes text,
  link_linkedin text,
  link_site text,
  status_profissional public.status_profissional,
  visivel_recrutadores boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis públicos" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Inserir próprio perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Editar próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver próprios papéis" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Ativar perfil de vendedor (o próprio usuário)
CREATE OR REPLACE FUNCTION public.become_seller()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'vendedor') ON CONFLICT DO NOTHING;
END; $$;
REVOKE EXECUTE ON FUNCTION public.become_seller() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.become_seller() TO authenticated;

-- Novo usuário => perfil + papel membro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base text; uname text; n int := 0;
BEGIN
  base := lower(regexp_replace(split_part(coalesce(NEW.email,'usuario'),'@',1), '[^a-z0-9_.-]', '', 'gi'));
  IF char_length(base) < 3 THEN base := base || 'user'; END IF;
  base := left(base, 24);
  uname := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = uname) LOOP
    n := n + 1; uname := base || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, nome, avatar_url)
  VALUES (NEW.id, uname,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'membro') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categorias públicas" ON public.categories FOR SELECT TO anon, authenticated USING (true);

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo text NOT NULL CHECK (char_length(titulo) BETWEEN 3 AND 150),
  descricao text NOT NULL DEFAULT '' CHECK (char_length(descricao) <= 10000),
  tipo public.product_type NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  preco_centavos integer NOT NULL CHECK (preco_centavos >= 0 AND preco_centavos <= 10000000),
  capa_url text,
  publicado boolean NOT NULL DEFAULT false,
  destaque boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.products (seller_id);
CREATE INDEX ON public.products (publicado, created_at DESC);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produtos publicados visíveis" ON public.products FOR SELECT TO anon, authenticated USING (publicado = true);
CREATE POLICY "Vendedor vê seus produtos" ON public.products FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Vendedor cria produtos" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id AND public.has_role(auth.uid(),'vendedor'));
CREATE POLICY "Vendedor edita produtos" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Vendedor apaga produtos" ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id);
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORDERS (escrita apenas pelo servidor)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL,
  valor_centavos integer NOT NULL CHECK (valor_centavos >= 0),
  comissao_centavos integer NOT NULL CHECK (comissao_centavos >= 0),
  liquido_centavos integer GENERATED ALWAYS AS (valor_centavos - comissao_centavos) STORED,
  status public.order_status NOT NULL DEFAULT 'pendente',
  metodo public.payment_method,
  provider_session_id text UNIQUE,
  provider_payment_id text,
  pago_em timestamptz,
  reembolso_ate timestamptz,
  reembolso_solicitado_em timestamptz,
  reembolsado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.orders (buyer_id);
CREATE INDEX ON public.orders (seller_id);
CREATE INDEX ON public.orders (product_id);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comprador vê pedidos" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = buyer_id);
CREATE POLICY "Vendedor vê vendas" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.has_access(_user_id uuid, _product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders WHERE buyer_id = _user_id AND product_id = _product_id AND status = 'pago')
      OR EXISTS (SELECT 1 FROM public.products WHERE id = _product_id AND seller_id = _user_id)
$$;

-- PRODUCT FILES (arquivos privados para download)
CREATE TABLE public.product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  nome text NOT NULL,
  storage_path text NOT NULL,
  tamanho_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_files TO authenticated;
GRANT ALL ON public.product_files TO service_role;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso a arquivos" ON public.product_files FOR SELECT TO authenticated USING (public.has_access(auth.uid(), product_id));
CREATE POLICY "Vendedor gerencia arquivos" ON public.product_files FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()));

-- COURSE MODULES (títulos públicos = conteúdo programático)
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.course_modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_modules TO authenticated;
GRANT ALL ON public.course_modules TO service_role;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Módulos visíveis" ON public.course_modules FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.publicado OR p.seller_id = auth.uid())));
CREATE POLICY "Vendedor gerencia módulos" ON public.course_modules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()));

-- LESSONS (título/descrição públicos)
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aulas visíveis" ON public.lessons FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.publicado OR p.seller_id = auth.uid())));
CREATE POLICY "Vendedor gerencia aulas" ON public.lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()));

-- LESSON CONTENT (vídeo — só compradores)
CREATE TABLE public.lesson_content (
  lesson_id uuid PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  video_url text CHECK (video_url IS NULL OR video_url ~* '^https://(www\.)?(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)/')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_content TO authenticated;
GRANT ALL ON public.lesson_content TO service_role;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comprador vê vídeo" ON public.lesson_content FOR SELECT TO authenticated USING (public.has_access(auth.uid(), product_id));
CREATE POLICY "Vendedor gerencia vídeo" ON public.lesson_content FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()));

-- LESSON MATERIALS (anexos — só compradores)
CREATE TABLE public.lesson_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  nome text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_materials TO authenticated;
GRANT ALL ON public.lesson_materials TO service_role;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comprador vê materiais" ON public.lesson_materials FOR SELECT TO authenticated USING (public.has_access(auth.uid(), product_id));
CREATE POLICY "Vendedor gerencia materiais" ON public.lesson_materials FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.seller_id = auth.uid()));

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  concluida_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver próprio progresso" ON public.lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Marcar progresso" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.has_access(auth.uid(), product_id));
CREATE POLICY "Desmarcar progresso" ON public.lesson_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- REVIEWS (somente após compra)
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario text CHECK (char_length(comentario) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Avaliações públicas" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Avaliar após compra" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.orders o WHERE o.buyer_id = auth.uid() AND o.product_id = reviews.product_id AND o.status = 'pago'));
CREATE POLICY "Editar própria avaliação" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Apagar própria avaliação" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- VIEW de estatísticas públicas dos produtos
CREATE VIEW public.product_stats WITH (security_invoker = false) AS
SELECT p.id AS product_id,
  coalesce((SELECT avg(nota)::numeric(3,2) FROM public.reviews r WHERE r.product_id = p.id), 0) AS nota_media,
  (SELECT count(*) FROM public.reviews r WHERE r.product_id = p.id) AS total_avaliacoes,
  (SELECT count(*) FROM public.orders o WHERE o.product_id = p.id AND o.status = 'pago') AS total_vendas
FROM public.products p WHERE p.publicado = true;
GRANT SELECT ON public.product_stats TO anon, authenticated;

-- SEED: categorias
INSERT INTO public.categories (slug, nome) VALUES
 ('educacao-infantil','Educação Infantil'),('matematica','Matemática'),('portugues','Língua Portuguesa'),
 ('ciencias','Ciências'),('historia','História'),('geografia','Geografia'),('ingles','Inglês'),
 ('pedagogia','Pedagogia e Didática'),('tecnologia-educacional','Tecnologia Educacional'),('pesquisa-academica','Pesquisa Acadêmica');

-- SEED: professores de exemplo
INSERT INTO public.profiles (id, username, nome, bio, formacao, area_atuacao, cidade, estado, status_profissional, visivel_recrutadores) VALUES
 ('11111111-1111-1111-1111-111111111111','prof.marina','Marina Albuquerque','Professora de Matemática há 15 anos, apaixonada por metodologias ativas e jogos em sala de aula.','Mestre em Educação Matemática (USP)','Matemática','São Paulo','SP','empregado',true),
 ('22222222-2222-2222-2222-222222222222','joao.leitura','João Batista Ferreira','Alfabetizador e pesquisador em letramento. Ajudo professores a transformar a leitura em hábito.','Doutor em Linguística (UFMG)','Língua Portuguesa','Belo Horizonte','MG','freelancer',true),
 ('33333333-3333-3333-3333-333333333333','ana.ciencias','Ana Clara Ribeiro','Bióloga e professora do ensino médio. Crio experimentos de baixo custo para laboratório escolar.','Licenciada em Ciências Biológicas (UFPE)','Ciências','Recife','PE','buscando_emprego',false);
INSERT INTO public.user_roles (user_id, role) VALUES
 ('11111111-1111-1111-1111-111111111111','vendedor'),('22222222-2222-2222-2222-222222222222','vendedor'),('33333333-3333-3333-3333-333333333333','vendedor');

-- SEED: produtos
INSERT INTO public.products (id, seller_id, titulo, descricao, tipo, category_id, preco_centavos, publicado, destaque) VALUES
 ('a0000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Matemática Divertida: Jogos para o Fundamental II','Curso completo com 20 jogos prontos para ensinar frações, equações e geometria de forma lúdica.','curso',(SELECT id FROM public.categories WHERE slug='matematica'),19700,true,true),
 ('a0000000-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Banco de Questões ENEM — Matemática','E-book com 300 questões comentadas, organizadas por competência e habilidade da BNCC.','ebook',(SELECT id FROM public.categories WHERE slug='matematica'),4990,true,false),
 ('a0000000-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Alfabetização com Método Fônico','Curso prático para professores do 1º e 2º ano, com sequências didáticas e avaliações diagnósticas.','curso',(SELECT id FROM public.categories WHERE slug='portugues'),24900,true,true),
 ('a0000000-0000-0000-0000-000000000004','22222222-2222-2222-2222-222222222222','Hábitos de Leitura na Escola Pública: um estudo de caso','Pesquisa com 1.200 alunos de 14 escolas sobre fatores que influenciam o gosto pela leitura.','pesquisa',(SELECT id FROM public.categories WHERE slug='pesquisa-academica'),2900,true,false),
 ('a0000000-0000-0000-0000-000000000005','33333333-3333-3333-3333-333333333333','Kit de Experimentos de Baixo Custo','Material didático com 40 roteiros de experimentos usando materiais recicláveis.','material_didatico',(SELECT id FROM public.categories WHERE slug='ciencias'),3900,true,true),
 ('a0000000-0000-0000-0000-000000000006','33333333-3333-3333-3333-333333333333','Mentoria: Planejamento Anual com a BNCC','Quatro encontros online para montar seu planejamento anual alinhado à BNCC.','mentoria',(SELECT id FROM public.categories WHERE slug='pedagogia'),35000,true,false);

-- SEED: módulos e aulas dos cursos
INSERT INTO public.course_modules (id, product_id, titulo, ordem) VALUES
 ('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Introdução à gamificação',1),
 ('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Jogos de frações',2),
 ('b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003','Fundamentos do método fônico',1),
 ('b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000003','Sequências didáticas',2);
INSERT INTO public.lessons (id, module_id, product_id, titulo, descricao, ordem) VALUES
 ('c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Por que jogar em sala de aula?','Os benefícios dos jogos para a aprendizagem.',1),
 ('c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Organizando a turma','Grupos, regras e tempo.',2),
 ('c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Dominó de frações','Passo a passo do jogo.',1),
 ('c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003','Consciência fonológica','O que é e como desenvolver.',1),
 ('c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000003','Planejando a primeira semana','Modelo de sequência.',1);
INSERT INTO public.lesson_content (lesson_id, product_id, video_url) VALUES
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
 ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
 ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000003','https://vimeo.com/76979871'),
 ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000003','https://vimeo.com/76979871');
