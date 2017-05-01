PGDMP         /                u            Martin    9.5.2    9.5.1 7    ~	           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                       false            	           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                       false            �	           1262    16385    Martin    DATABASE     z   CREATE DATABASE "Martin" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';
    DROP DATABASE "Martin";
             Martin    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
             postgres    false            �	           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                  postgres    false    6            �	           0    0    public    ACL     �   REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;
                  postgres    false    6                        3079    12623    plpgsql 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;
    DROP EXTENSION plpgsql;
                  false            �	           0    0    EXTENSION plpgsql    COMMENT     @   COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
                       false    1            �            1259    16464    cdn_interface    TABLE     �  CREATE TABLE cdn_interface (
    id integer NOT NULL,
    name character varying(20),
    url character varying(100),
    url_translator character varying(100),
    url_cdn character varying(100),
    port_cdn integer,
    login character varying(20),
    pass character varying(20),
    priority integer,
    endpoint_type_id integer,
    endpoint_gateway_type_id integer,
    offer_status numeric(1,0) DEFAULT 4
);
 !   DROP TABLE public.cdn_interface;
       public         Martin    false    6            �            1259    16462    cdninterface_id_seq    SEQUENCE     u   CREATE SEQUENCE cdninterface_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.cdninterface_id_seq;
       public       Martin    false    184    6            �	           0    0    cdninterface_id_seq    SEQUENCE OWNED BY     >   ALTER SEQUENCE cdninterface_id_seq OWNED BY cdn_interface.id;
            public       Martin    false    183            �            1259    16531    endpoint_gateway_type    TABLE     y   CREATE TABLE endpoint_gateway_type (
    id_gateway integer NOT NULL,
    endpoint_gateway_type character varying(20)
);
 )   DROP TABLE public.endpoint_gateway_type;
       public         Martin    false    6            �            1259    16529    endpoint_gateway_type_id_seq    SEQUENCE     ~   CREATE SEQUENCE endpoint_gateway_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.endpoint_gateway_type_id_seq;
       public       Martin    false    6    190            �	           0    0    endpoint_gateway_type_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE endpoint_gateway_type_id_seq OWNED BY endpoint_gateway_type.id_gateway;
            public       Martin    false    189            �            1259    16523    endpoint_type    TABLE     e   CREATE TABLE endpoint_type (
    id_type integer NOT NULL,
    endpoint_type character varying(6)
);
 !   DROP TABLE public.endpoint_type;
       public         Martin    false    6            �            1259    16521    endpoint_type_id_seq    SEQUENCE     v   CREATE SEQUENCE endpoint_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.endpoint_type_id_seq;
       public       Martin    false    6    188            �	           0    0    endpoint_type_id_seq    SEQUENCE OWNED BY     D   ALTER SEQUENCE endpoint_type_id_seq OWNED BY endpoint_type.id_type;
            public       Martin    false    187            �            1259    16515 	   footprint    TABLE     �   CREATE TABLE footprint (
    id integer NOT NULL,
    endpoint_id integer,
    subnet_num integer,
    mask_num integer,
    subnet_ip character varying(15),
    prefix integer
);
    DROP TABLE public.footprint;
       public         Martin    false    6            �            1259    16513    footprint_id_seq    SEQUENCE     r   CREATE SEQUENCE footprint_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.footprint_id_seq;
       public       Martin    false    186    6            �	           0    0    footprint_id_seq    SEQUENCE OWNED BY     7   ALTER SEQUENCE footprint_id_seq OWNED BY footprint.id;
            public       Martin    false    185            �            1259    16634    offer_status    TABLE     t   CREATE TABLE offer_status (
    status character varying(10) NOT NULL,
    id_offer_status numeric(1,0) NOT NULL
);
     DROP TABLE public.offer_status;
       public         Martin    false    6            �            1259    16639    offer_status_id_type_seq    SEQUENCE     z   CREATE SEQUENCE offer_status_id_type_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.offer_status_id_type_seq;
       public       Martin    false    6    191            �	           0    0    offer_status_id_type_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE offer_status_id_type_seq OWNED BY offer_status.id_offer_status;
            public       Martin    false    192            �            1259    16452    users    TABLE     �   CREATE TABLE users (
    id integer NOT NULL,
    login character varying(100) NOT NULL,
    pass character varying(100) NOT NULL,
    admin boolean NOT NULL
);
    DROP TABLE public.users;
       public         Martin    false    6            �            1259    16450    users_id_seq    SEQUENCE     n   CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public       Martin    false    6    182            �	           0    0    users_id_seq    SEQUENCE OWNED BY     /   ALTER SEQUENCE users_id_seq OWNED BY users.id;
            public       Martin    false    181            �           2604    16467    id    DEFAULT     e   ALTER TABLE ONLY cdn_interface ALTER COLUMN id SET DEFAULT nextval('cdninterface_id_seq'::regclass);
 ?   ALTER TABLE public.cdn_interface ALTER COLUMN id DROP DEFAULT;
       public       Martin    false    184    183    184            �           2604    16534 
   id_gateway    DEFAULT     ~   ALTER TABLE ONLY endpoint_gateway_type ALTER COLUMN id_gateway SET DEFAULT nextval('endpoint_gateway_type_id_seq'::regclass);
 O   ALTER TABLE public.endpoint_gateway_type ALTER COLUMN id_gateway DROP DEFAULT;
       public       Martin    false    189    190    190            �           2604    16526    id_type    DEFAULT     k   ALTER TABLE ONLY endpoint_type ALTER COLUMN id_type SET DEFAULT nextval('endpoint_type_id_seq'::regclass);
 D   ALTER TABLE public.endpoint_type ALTER COLUMN id_type DROP DEFAULT;
       public       Martin    false    188    187    188            �           2604    16518    id    DEFAULT     ^   ALTER TABLE ONLY footprint ALTER COLUMN id SET DEFAULT nextval('footprint_id_seq'::regclass);
 ;   ALTER TABLE public.footprint ALTER COLUMN id DROP DEFAULT;
       public       Martin    false    186    185    186            �           2604    16649    id_offer_status    DEFAULT     v   ALTER TABLE ONLY offer_status ALTER COLUMN id_offer_status SET DEFAULT nextval('offer_status_id_type_seq'::regclass);
 K   ALTER TABLE public.offer_status ALTER COLUMN id_offer_status DROP DEFAULT;
       public       Martin    false    192    191            �           2604    16455    id    DEFAULT     V   ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public       Martin    false    182    181    182            s	          0    16464    cdn_interface 
   TABLE DATA                     public       Martin    false    184   g9       �	           0    0    cdninterface_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('cdninterface_id_seq', 5, true);
            public       Martin    false    183            y	          0    16531    endpoint_gateway_type 
   TABLE DATA                     public       Martin    false    190   Z:       �	           0    0    endpoint_gateway_type_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('endpoint_gateway_type_id_seq', 2, true);
            public       Martin    false    189            w	          0    16523    endpoint_type 
   TABLE DATA                     public       Martin    false    188   �:       �	           0    0    endpoint_type_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('endpoint_type_id_seq', 2, true);
            public       Martin    false    187            u	          0    16515 	   footprint 
   TABLE DATA                     public       Martin    false    186   (;       �	           0    0    footprint_id_seq    SEQUENCE SET     8   SELECT pg_catalog.setval('footprint_id_seq', 11, true);
            public       Martin    false    185            z	          0    16634    offer_status 
   TABLE DATA                     public       Martin    false    191   !<       �	           0    0    offer_status_id_type_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('offer_status_id_type_seq', 1, false);
            public       Martin    false    192            q	          0    16452    users 
   TABLE DATA                     public       Martin    false    182   �<       �	           0    0    users_id_seq    SEQUENCE SET     3   SELECT pg_catalog.setval('users_id_seq', 3, true);
            public       Martin    false    181            �           2606    16469    cdninterface_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY cdn_interface
    ADD CONSTRAINT cdninterface_pkey PRIMARY KEY (id);
 I   ALTER TABLE ONLY public.cdn_interface DROP CONSTRAINT cdninterface_pkey;
       public         Martin    false    184    184            �           2606    16536    endpoint_gateway_type_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY endpoint_gateway_type
    ADD CONSTRAINT endpoint_gateway_type_pkey PRIMARY KEY (id_gateway);
 Z   ALTER TABLE ONLY public.endpoint_gateway_type DROP CONSTRAINT endpoint_gateway_type_pkey;
       public         Martin    false    190    190            �           2606    16528    endpoint_type_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY endpoint_type
    ADD CONSTRAINT endpoint_type_pkey PRIMARY KEY (id_type);
 J   ALTER TABLE ONLY public.endpoint_type DROP CONSTRAINT endpoint_type_pkey;
       public         Martin    false    188    188            �           2606    16520    footprint_pkey 
   CONSTRAINT     O   ALTER TABLE ONLY footprint
    ADD CONSTRAINT footprint_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.footprint DROP CONSTRAINT footprint_pkey;
       public         Martin    false    186    186            �           2606    16623    footprints_endpoint_id_const 
   CONSTRAINT     a   ALTER TABLE ONLY footprint
    ADD CONSTRAINT footprints_endpoint_id_const UNIQUE (endpoint_id);
 P   ALTER TABLE ONLY public.footprint DROP CONSTRAINT footprints_endpoint_id_const;
       public         Martin    false    186    186            �           2606    16651    offer_status_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY offer_status
    ADD CONSTRAINT offer_status_pkey PRIMARY KEY (id_offer_status);
 H   ALTER TABLE ONLY public.offer_status DROP CONSTRAINT offer_status_pkey;
       public         Martin    false    191    191            �           2606    16457 
   users_pkey 
   CONSTRAINT     G   ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public         Martin    false    182    182            �           1259    16661 &   fki_cdn_interface_offer_status_id_fkey    INDEX     a   CREATE INDEX fki_cdn_interface_offer_status_id_fkey ON cdn_interface USING btree (offer_status);
 :   DROP INDEX public.fki_cdn_interface_offer_status_id_fkey;
       public         Martin    false    184            �           2606    16538 +   cdn_interface_endpoint_gateway_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY cdn_interface
    ADD CONSTRAINT cdn_interface_endpoint_gateway_type_id_fkey FOREIGN KEY (endpoint_gateway_type_id) REFERENCES endpoint_gateway_type(id_gateway);
 c   ALTER TABLE ONLY public.cdn_interface DROP CONSTRAINT cdn_interface_endpoint_gateway_type_id_fkey;
       public       Martin    false    2296    190    184            �           2606    16543 #   cdn_interface_endpoint_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY cdn_interface
    ADD CONSTRAINT cdn_interface_endpoint_type_id_fkey FOREIGN KEY (endpoint_type_id) REFERENCES endpoint_type(id_type);
 [   ALTER TABLE ONLY public.cdn_interface DROP CONSTRAINT cdn_interface_endpoint_type_id_fkey;
       public       Martin    false    2294    184    188            �           2606    16656 "   cdn_interface_offer_status_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY cdn_interface
    ADD CONSTRAINT cdn_interface_offer_status_id_fkey FOREIGN KEY (offer_status) REFERENCES offer_status(id_offer_status);
 Z   ALTER TABLE ONLY public.cdn_interface DROP CONSTRAINT cdn_interface_offer_status_id_fkey;
       public       Martin    false    191    2298    184            s	   �   x��P�j�0��+tk&m�Bw��@ia�v5j�f�l������v�m��x�'	�C�{=As8�SNG:��i�%��܂����.Z$�7�>У��b��12メI�vj�|X�4j��~+$��ӏ��^	����۵00���>θ��C{���ժ*��'��q�\v*9���9��Te�a�`\����Y���^k��s���0�_�X�U%��e_����      y	   ]   x���v
Q���WH�K)���+�OO,I-O��/�,HU��L�	�`W�������a�����������i��IU��ƻ���F���� �>�      w	   Q   x���v
Q���WH�K)���+�/�,HU��L3tP�5�}B]�4u�s�s�5��<�7�hNQjn~I*� .. .�/�      u	   �   x����
�0E����E!�R�+]D��V*m��mi��_�L_��d�Ź3�d���{H��u�7mY�0*3y�55f'J�۹��Su�r���e8�۲�дyQ>�p\��F��P$R�	�H�.-�ǋ(	E7Z
�Jy��?�V!�S_-o�0��0T�̿��f�}���<跁�����?�_|H�u��=���h������Z'���l�JƖZCp�lCcG%G��Y,=      z	   o   x���v
Q���W�OKK-�/.I,)-VЀ�:
�)���
a�>���
�~���:
���\��☜�ZP��4ʐB��A�`��(4�%59'3l�1�F�� �e4�� �cyt      q	   ^   x���v
Q���W(-N-*V��L�Q��O���Q(H,.�QHL����Ts�	uV�0�QP�#1J�JS5��<I7�h
H�:�NK�)��� �/     