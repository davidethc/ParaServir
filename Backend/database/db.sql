

CREATE TABLE IF NOT EXISTS public.admin_actions
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    admin_id uuid NOT NULL,
    action character varying(200) COLLATE pg_catalog."default" NOT NULL,
    details text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT admin_actions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.messages
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    request_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.profiles
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    full_name character varying(120) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(20) COLLATE pg_catalog."default",
    avatar_url text COLLATE pg_catalog."default",
    bio text COLLATE pg_catalog."default",
    location text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.reviews
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    request_id uuid NOT NULL,
    client_id uuid NOT NULL,
    worker_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT reviews_request_id_key UNIQUE (request_id)
);

CREATE TABLE IF NOT EXISTS public.service_categories
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    icon character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT service_categories_pkey PRIMARY KEY (id),
    CONSTRAINT service_categories_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.service_requests
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    client_id uuid NOT NULL,
    worker_id uuid,
    category_id uuid NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    address text COLLATE pg_catalog."default",
    scheduled_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT service_requests_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    email character varying(150) COLLATE pg_catalog."default" NOT NULL,
    password_hash text COLLATE pg_catalog."default" NOT NULL,
    role character varying(20) COLLATE pg_catalog."default" NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.worker_profiles
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    service_description text COLLATE pg_catalog."default" NOT NULL,
    years_experience integer DEFAULT 0,
    certification_url text COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    verification_status character varying(20) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT worker_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT worker_profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.worker_services
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    worker_id uuid NOT NULL,
    category_id uuid NOT NULL,
    title character varying(150) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    base_price numeric(10, 2),
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT worker_services_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.admin_actions
    ADD CONSTRAINT admin_actions_admin_id_fkey FOREIGN KEY (admin_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.messages
    ADD CONSTRAINT messages_request_id_fkey FOREIGN KEY (request_id)
    REFERENCES public.service_requests (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS profiles_user_id_key
    ON public.profiles(user_id);


ALTER TABLE IF EXISTS public.reviews
    ADD CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.reviews
    ADD CONSTRAINT reviews_request_id_fkey FOREIGN KEY (request_id)
    REFERENCES public.service_requests (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS reviews_request_id_key
    ON public.reviews(request_id);


ALTER TABLE IF EXISTS public.reviews
    ADD CONSTRAINT reviews_worker_id_fkey FOREIGN KEY (worker_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.service_requests
    ADD CONSTRAINT service_requests_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES public.service_categories (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.service_requests
    ADD CONSTRAINT service_requests_client_id_fkey FOREIGN KEY (client_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.service_requests
    ADD CONSTRAINT service_requests_worker_id_fkey FOREIGN KEY (worker_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;


ALTER TABLE IF EXISTS public.worker_profiles
    ADD CONSTRAINT worker_profiles_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS worker_profiles_user_id_key
    ON public.worker_profiles(user_id);


ALTER TABLE IF EXISTS public.worker_services
    ADD CONSTRAINT worker_services_category_id_fkey FOREIGN KEY (category_id)
    REFERENCES public.service_categories (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.worker_services
    ADD CONSTRAINT worker_services_worker_id_fkey FOREIGN KEY (worker_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

END;