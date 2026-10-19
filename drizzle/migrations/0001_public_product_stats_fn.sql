CREATE OR REPLACE FUNCTION public.get_product_stats()
RETURNS TABLE(product_id uuid, nota_media numeric, total_avaliacoes bigint, total_vendas bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id,
    COALESCE((SELECT avg(r.nota)::numeric(3,2) FROM reviews r WHERE r.product_id = p.id), 0),
    (SELECT count(*) FROM reviews r WHERE r.product_id = p.id),
    (SELECT count(*) FROM orders o WHERE o.product_id = p.id AND o.status = 'pago')
  FROM products p WHERE p.publicado = true;
$$;
GRANT EXECUTE ON FUNCTION public.get_product_stats() TO anon, authenticated;