import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [minutesToRead, setMinutesToRead] = useState(0);
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={commonStyles.container}>
        <span className={commonStyles.loadingText}>Carregando...</span>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (post.data.content) {
      const totalNumberOfWords = post.data.content.reduce(
        (acc, { body }) =>
          acc +
          RichText.asText(body)
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ').length,
        0
      );

      setMinutesToRead(Math.ceil(totalNumberOfWords / 200));
    }
  }, [post.data.content]);

  return (
    <main className={styles.container}>
      <img src={post.data.banner.url} alt="Post Banner" />

      <article className={commonStyles.container}>
        <h1>{post.data.title}</h1>

        <div className={commonStyles.tagsContainer}>
          <time className={commonStyles.tag}>
            <FiCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <span className={commonStyles.tag}>
            <FiUser />
            {post.data.author}
          </span>
          <span className={commonStyles.tag}>
            <FiClock />
            {minutesToRead} min
          </span>
        </div>

        {post.data.content.map(({ heading, body }) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <div
              className={styles.postContent}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(body),
              }}
            />
          </section>
        ))}
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: process.env.PRISMIC_API_PAGE_SIZE,
    }
  );

  return {
    paths: posts.results.map(result => ({ params: { slug: result.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', slug as string, {});

  return {
    props: {
      post,
    },
  };
};
