import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { next_page, results },
}: HomeProps) {
  const [page, setPage] = useState(2);
  const [hasNextPage, setHasNextPage] = useState(!!next_page);
  const [posts, setPosts] = useState(results);

  function handleGetMorePosts() {
    fetch(`api/get_posts?page=${page}`, { method: 'GET' }).then(response =>
      response.json().then((newPosts: PostPagination) => {
        setPage(e => e + 1);

        setHasNextPage(!!newPosts.next_page);

        setPosts(e => [...e, ...newPosts.results]);
      })
    );
  }

  return (
    <main className={commonStyles.container}>
      <section className={styles.postsContainer}>
        {posts.map(
          ({
            uid,
            first_publication_date,
            data: { title, subtitle, author },
          }) => (
            <Link key={uid} href={`/post/${uid}`}>
              <a>
                <strong className="title">{title}</strong>
                <span className="subtitle">{subtitle}</span>

                <div className={commonStyles.tagsContainer}>
                  <time className={commonStyles.tag}>
                    <FiCalendar />
                    {format(new Date(first_publication_date), 'dd MMM yyyy', {
                      locale: ptBR,
                    })}
                  </time>
                  <span className={commonStyles.tag}>
                    <FiUser />
                    {author}
                  </span>
                </div>
              </a>
            </Link>
          )
        )}

        {hasNextPage && (
          <button type="button" onClick={handleGetMorePosts}>
            Carregar mais posts
          </button>
        )}
      </section>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: process.env.PRISMIC_API_PAGE_SIZE,
    }
  );

  const results = postsResponse.results.map(
    ({ uid, first_publication_date, data: { title, subtitle, author } }) => {
      return {
        uid,
        first_publication_date,
        data: {
          title,
          subtitle,
          author,
        },
      };
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
