-- Apaga as tabelas se já existirem (permite rodar o script de novo do zero)
-- ATENÇÃO: isso apaga todos os dados!
DROP TABLE IF EXISTS inscricoes, eventos, categorias, usuarios CASCADE;

CREATE TABLE usuarios (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL,
  perfil      VARCHAR(20)  NOT NULL DEFAULT 'usuario'
              CHECK (perfil IN ('usuario', 'organizador', 'admin')),
  ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE eventos (
  id              SERIAL PRIMARY KEY,
  organizador_id  INTEGER NOT NULL REFERENCES usuarios(id)   ON DELETE RESTRICT,
  categoria_id    INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  titulo          VARCHAR(150) NOT NULL,
  descricao       TEXT         NOT NULL,
  data_hora       TIMESTAMPTZ  NOT NULL,
  local_nome      VARCHAR(150) NOT NULL,
  endereco        VARCHAR(200) NOT NULL,
  cidade          VARCHAR(100) NOT NULL,
  capacidade      INTEGER      NOT NULL CHECK (capacidade > 0),
  acessibilidade  TEXT,
  imagem_url      TEXT,
  status          VARCHAR(20)  NOT NULL DEFAULT 'publicado'
                  CHECK (status IN ('publicado', 'cancelado', 'encerrado')),
  criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE inscricoes (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id   INTEGER NOT NULL REFERENCES eventos(id)  ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'ativa'
              CHECK (status IN ('ativa', 'cancelada')),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, evento_id)   -- impede inscrição duplicada
);