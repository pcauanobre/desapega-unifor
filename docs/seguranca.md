# Segurança do Desapega Unifor

O frontend é público e a chave `anon` do Supabase vive dentro do bundle do
navegador, como manda o projeto dela. Então a segurança **não pode morar no
React**: um `if` de interface só decide o que aparece, nunca o que pode. Quem
decide de verdade é o banco (Row Level Security e privilégio por coluna) e a
borda da API.

## Camadas

**1. Row Level Security no Postgres.** Toda tabela nasce com RLS ligada e
`REVOKE ALL` pros papéis `anon` e `authenticated`. O acesso volta em doses:

| Ação | Quem pode |
|---|---|
| Ler a vitrine | qualquer visitante (é uma vitrine) |
| Criar anúncio | logado, e só como ele mesmo (`autor_id = auth.uid()`) |
| Editar / excluir | só o dono da linha |
| Marcar como vendido | só o dono da linha |

**2. Privilégio por coluna.** Nem toda coluna é pública. O telefone de
contato, por exemplo, não é selecionável: ele sai um por vez, por função,
pra ninguém baixar a agenda inteira numa requisição só (migration 017).

**3. Funções `SECURITY DEFINER` de propósito único.** Onde o usuário
precisa de um poder que ele não tem direto, entra uma função que só sabe
fazer aquilo:

- `registrar_clique(uuid)` só soma 1 no contador (visitante não tem UPDATE)
- `perfil_publico(uuid)` devolve nome, foto, curso e contadores. Email e
  celular não passam por ela
- `contato_do_anuncio(uuid)` devolve UM telefone
- `deletar_minha_conta()` apaga só a conta de quem chamou (guard de sessão
  na primeira linha)

**4. Identidade nunca vem do cliente.** `autor_id` e `autor_nome` saem da
sessão no servidor. Mandar `autor_id` de outra pessoa no corpo da
requisição não adianta: o banco recusa.

**5. Validação na borda com allow-list.** Todo corpo passa por
`lib/validar-anuncio.ts` (tipos, tamanhos, categoria dentro da lista) antes
de chegar no banco, que ainda revalida por `CHECK`. Consultas são sempre
parametrizadas.

**6. Rate limit por IP** (`middleware.ts`): 100 requisições por minuto na
vitrine, 5 por 15 minutos no envio de email. Os códigos de email têm um
segundo limite no banco, por email, que independe de instância.

**7. Códigos de 6 dígitos** (cadastro e recuperação de senha): gerados por
CSPRNG, válidos por 15 minutos, 5 tentativas, queimados no primeiro uso. As
tabelas que guardam esses códigos são invisíveis pra API.

**8. Headers** (`next.config.ts`): CSP travando script de fora,
`frame-ancestors 'none'` contra clickjacking, HSTS, `nosniff` e
`Referrer-Policy`.

**9. Segredos.** Só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
são públicas (por design). `DATABASE_URL` e `BREVO_API_KEY` existem apenas no
servidor e não aparecem no bundle.

## Como isso foi testado

Um script de ataque cria duas contas e, logado na primeira, tenta:
alterar, apagar e forjar anúncio da segunda; ler as tabelas de códigos;
baixar a lista de telefones; alcançar `auth.users`. Também roda tudo de
novo como visitante anônimo. **Todas as tentativas são negadas pelo banco**,
e o fluxo legítimo (publicar o próprio anúncio, ver um contato, contar
clique) continua funcionando.
