import { apiGet } from '@/lib/server-api';
import type { Course } from '@repo/types';
import { HomeHero } from '@/components/home/home-hero';
import { LatestCoursesSection } from '@/components/home/latest-courses-section';
import { CategoriesSection } from '@/components/home/categories-section';
import { RecommendedForYou } from '@/components/home/recommended-client';
import { RequestCourseCta } from '@/components/home/request-course-cta';
import { HomePlainSection, HomeSurfaceBand } from '@/components/home/home-bands';
import { HomeSearchStrip } from '@/components/home/home-search-strip';

type Category = { _id: string; name: string; slug: string };
type ListResponse = { items: Course[]; total: number };

export default async function HomePage() {
  const [categories, meta, spotlight, latest] = await Promise.all([
    apiGet<Category[]>('/categories'),
    apiGet<ListResponse>('/courses?limit=1'),
    apiGet<ListResponse>('/courses?featured=true&limit=8'),
    apiGet<ListResponse>('/courses?limit=36'),
  ]);

  return (
    <div className="space-y-10 sm:space-y-12">
      <HomeHero courseCount={meta.total} categoryCount={categories.length} />

      <HomeSearchStrip />

      <HomeSurfaceBand>
        <LatestCoursesSection spotlight={spotlight.items} latest={latest.items} />
      </HomeSurfaceBand>

      <HomePlainSection>
        <CategoriesSection categories={categories} />
      </HomePlainSection>

      <HomeSurfaceBand>
        <RecommendedForYou courses={latest.items} />
      </HomeSurfaceBand>

      <RequestCourseCta />
    </div>
  );
}
