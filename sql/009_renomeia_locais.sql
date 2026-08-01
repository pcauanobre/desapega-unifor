-- 009: renomeia locais de retirada pros nomes reais do campus.
-- "Praça central" é o Centro de Convivência (CC) e biblioteca só tem uma.
-- Anúncios antigos passam a usar os mesmos nomes que o formulário oferece.

update anuncios set bloco = 'Centro de Convivência (CC)' where bloco = 'Praça central';
update anuncios set bloco = 'Biblioteca' where bloco = 'Biblioteca central';
