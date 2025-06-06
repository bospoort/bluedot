import { z } from 'zod';
import { formula } from 'airtable-ts-formula';
import db from '../../../../lib/api/db';
import { makeApiRoute } from '../../../../lib/api/makeApiRoute';
import { CmsJobPosting, cmsJobPostingTable } from '../../../../lib/api/db/tables';

export type GetJobsResponse = {
  type: 'success',
  jobs: Omit<CmsJobPosting, 'body'>[],
};

export default makeApiRoute({
  requireAuth: false,
  responseBody: z.object({
    type: z.literal('success'),
    jobs: z.array(z.any()),
  }),
}, async () => {
  const allJobs = await db.scan(cmsJobPostingTable, {
    filterByFormula: formula(await db.table(cmsJobPostingTable), ['=', { field: 'publicationStatus' }, 'Published']),
  });

  // Sort jobs alphabetically by title
  const sortedJobs = allJobs.sort((a, b) => a.title.localeCompare(b.title));

  // Remove the body field from each job to make the response lighter
  const jobSummaries = sortedJobs.map(({ body, ...rest }) => rest);

  return {
    type: 'success' as const,
    jobs: jobSummaries,
  };
});
