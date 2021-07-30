import { NextApiRequest, NextApiResponse } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../../services/prismic';

export default async function getPosts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const prismic = getPrismicClient(req);

    const { page = 1 } = req.query;

    const postsResponse = await prismic.query(
      Prismic.Predicates.at('document.type', 'posts'),
      {
        pageSize: process.env.PRISMIC_API_PAGE_SIZE,
        page,
      }
    );

    const results = postsResponse.results.map(
      ({ uid, first_publication_date, data: { title, subtitle, author } }) => {
        const formattedData = format(
          new Date(first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        );

        return {
          uid,
          first_publication_date: formattedData,
          data: {
            title,
            subtitle,
            author,
          },
        };
      }
    );

    return res.json({ next_page: postsResponse.next_page, results });
  }
  res.setHeader('Allow', 'GET');

  return res.status(405).end('Method not allowed');
}
