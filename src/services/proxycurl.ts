import defaultKy from 'ky';
import pThrottle from 'p-throttle';

import { throttleKy } from '@/lib/utils';

export const ProxycurlApiBaseUrl = 'https://nubela.co/proxycurl/api';

export interface PersonProfileOptions {
  linkedin_profile_url: string;
  fallback_to_cache?: 'on-error' | 'never';
  use_cache?: 'if-present' | 'if-recent';
  skills?: 'exclude' | 'include';
  inferred_salary?: 'exclude' | 'include';
  personal_email?: 'exclude' | 'include';
  personal_contact_number?: 'exclude' | 'include';
  twitter_profile_id?: 'exclude' | 'include';
  facebook_profile_id?: 'exclude' | 'include';
  github_profile_id?: 'exclude' | 'include';
  extra?: 'exclude' | 'include';
}

export interface PersonProfileResponse {
  public_identifier: string;
  profile_pic_url: string;
  background_cover_image_url: string;
  first_name: string;
  last_name: string;
  full_name: string;
  follower_count?: number;
  occupation: string;
  headline: string;
  summary?: string;
  country?: string;
  country_full_name?: string;
  city?: string;
  state?: string;
  experiences: Experience[];
  education: Education[];
  languages?: string[];
  accomplishment_organisations?: AccomplishmentOrg[];
  accomplishment_publications?: Publication[];
  accomplishment_honors_awards?: HonourAward[];
  accomplishment_patents?: Patent[];
  accomplishment_courses?: Course[];
  accomplishment_projects?: Project[];
  accomplishment_test_scores?: TestScore[];
  volunteer_work?: VolunteeringExperience[];
  certifications?: Certification[];
  connections: number;
  people_also_viewed?: PeopleAlsoViewed[];
  recommendations?: string[];
  activities?: Activity[];
  similarly_named_profiles?: SimilarProfile[];
  articles?: Article[];
  groups?: PersonGroup[];
  inferred_salary?: InferredSalary;
  gender: 'male' | 'female';
  birth_date?: ApiDate;
  industry: string;
  extra?: PersonExtra;
  interests?: string[];
  personal_emails?: string[];
  personal_numbers?: string[];
}

export interface Experience {
  starts_at?: ApiDate;
  ends_at?: ApiDate;
  company: string;
  company_linkedin_profile_url: string;
  title: string;
  description?: string;
  location?: string;
  logo_url?: string;
}

export interface ApiDate {
  day: number;
  month: number;
  year: number;
}

export interface Education {
  starts_at?: ApiDate;
  ends_at?: ApiDate;
  field_of_study: string;
  degree_name?: string;
  school: string;
  school_linkedin_profile_url?: string;
  description?: string;
  logo_url?: string;
  grade?: string;
  activities_and_societies?: string;
}

export interface AccomplishmentOrg {
  starts_at?: ApiDate;
  ends_at?: ApiDate;
  org_name: string;
  title: string;
  description?: string | null;
}

export interface Publication {
  name: string;
  publisher: string;
  published_on?: ApiDate;
  description?: string;
  url?: string;
}

export interface HonourAward {
  title: string;
  issuer: string;
  issued_on?: ApiDate;
  description?: string;
}

export interface Patent {
  title: string;
  issuer: string;
  issued_on?: ApiDate;
  description?: string;
  application_number?: string;
  patent_number?: string;
  url?: string;
}

export interface Course {
  name: string;
  number?: string;
}

export interface Project {
  starts_at?: ApiDate;
  ends_at?: ApiDate;
  title: string;
  description: string;
  url: string;
}

export interface TestScore {
  name: string;
  score: string;
  date_on?: ApiDate;
  description?: string;
}

export interface VolunteeringExperience {
  starts_at?: ApiDate;
  ends_at?: ApiDate;
  title: string;
  cause?: string;
  company: string;
  company_linkedin_profile_url: string;
  description?: string | null;
  logo_url?: string | null;
}

export interface Certification {
  name: string;
  authority: string;
  starts_at?: ApiDate;
  ends_at?: ApiDate;
  license_number?: string;
  display_source?: string;
  url?: string;
}

export interface PeopleAlsoViewed {
  link: string;
  name: string;
  summary?: string;
  location?: string;
}

export interface Activity {
  title: string;
  link: string;
  activity_status: string;
}

export interface SimilarProfile {
  name: string;
  link: string;
  summary?: string;
  location?: string;
}

export interface Article {
  title: string;
  link: string;
  published_date?: ApiDate;
  author?: string;
  image_url?: string;
}

export interface PersonGroup {
  profile_pic_url: string;
  name: string;
  url: string;
}

export interface InferredSalary {
  min?: number;
  max?: number;
}

export interface PersonExtra {
  github_profile_id?: string;
  facebook_profile_id?: string;
  twitter_profile_id?: string;
}

export interface PersonLookupOptions {
  company_domain: string;
  first_name: string;
  last_name?: string;
  similarity_checks?: 'include' | 'skip';
  enrich_profile?: 'skip' | 'enrich';
  location?: string;
  title?: string;
}

export interface PersonLookupResponse {
  url?: string;
  profile?: PersonProfileResponse;
  name_similarity_score?: number;
  company_similarity_score?: number;
  title_similarity_score?: number;
  location_similarity_score?: number;
}

export interface PersonSearchOptions {
  linkedin_company_profile_url: string;
  keyword_regex: string;
  page_size?: number;
  country?: string;
  enrich_profiles?: 'skip' | 'enrich';
  resolve_numeric_id?: boolean;
}

export interface PersonSearchResponse {
  employees: Array<{
    profile_url: string;
    profile: PersonProfileResponse;
    next_page: string;
  }>;
}

export interface CompanyProfileOptions {
  url: string;
  resolve_numeric_id?: boolean;
  categories?: 'exclude' | 'include';
  funding_data?: 'exclude' | 'include';
  extra?: 'exclude' | 'include';
  exit_data?: 'exclude' | 'include';
  acquisitions?: 'exclude' | 'include';
  use_cache?: 'if-present' | 'if-recent';
}

export interface CompanyProfileResponse {
  linkedin_internal_id: string;
  description: string;
  website: string;
  industry: string;
  company_size: [number, number?];
  company_size_on_linkedin: number;
  hq?: CompanyLocation;
  company_type:
    | 'EDUCATIONAL'
    | 'GOVERNMENT_AGENCY'
    | 'NON_PROFIT'
    | 'PARTNERSHIP'
    | 'PRIVATELY_HELD'
    | 'PUBLIC_COMPANY'
    | 'SELF_EMPLOYED'
    | 'SELF_OWNED';
  founded_year?: number;
  specialities?: string[];
  locations?: CompanyLocation[];
  name: string;
  tagline?: string;
  universal_name_id: string;
  profile_pic_url?: string;
  background_cover_image_url?: string;
  search_id: string;
  similar_companies?: SimilarCompany[];
  affiliated_companies?: AffiliatedCompany[];
  updates?: CompanyUpdate[];
  follower_count: number;
  acquisitions?: Acquisition[];
  exit_data?: Exit[];
  extra?: CompanyDetails;
  funding_data?: Funding[];
  categories?: string[];
}

type CompanyLocation = {
  country: string;
  city: string;
  postal_code: string;
  line_1: string;
  is_hq: boolean;
  state: string;
};

type SimilarCompany = {
  name: string;
  link: string;
  industry: string;
  location: string;
};

type AffiliatedCompany = {
  name: string;
  link: string;
  industry: string;
  location: string;
};

type CompanyUpdate = {
  article_link: string;
  image: string;
  posted_on: ApiDate;
  text: string;
  total_likes: number;
};

type Acquisition = {
  acquired: AcquiredCompany[];
  acquired_by: Acquisitor;
};

type AcquiredCompany = {
  linkedin_profile_url: string;
  crunchbase_profile_url: string;
  announced_date: ApiDate;
  price: number;
};

type Acquisitor = {
  linkedin_profile_url: string;
  crunchbase_profile_url: string;
  announced_date: ApiDate;
  price: number;
};

type Exit = {
  linkedin_profile_url: string;
  crunchbase_profile_url: string;
  name: string;
};

type CompanyDetails = {
  crunchbase_profile_url?: string;
  ipo_status: string;
  crunchbase_rank?: number;
  founding_date?: ApiDate;
  operating_status: string;
  company_type: string;
  contact_email: string;
  phone_number: string;
  facebook_id?: string;
  twitter_id?: string;
  number_of_funding_rounds: number;
  total_funding_amount: number;
  stock_symbol?: string;
  ipo_date?: Date;
  number_of_lead_investors: number;
  number_of_investors: number;
  total_fund_raised: number;
  number_of_investments: number;
  number_of_lead_investments: number;
  number_of_exits: number;
  number_of_acquisitions: number;
};

type Funding = {
  funding_type: string;
  announced_date: ApiDate;
  money_raised?: number;
  number_of_investor?: number;
  investor_list?: Investor[];
};

type Investor = {
  linkedin_profile_url?: string;
  name: string;
  type: string;
};

export interface CompanyLookupOptions {
  // requires either company_domain or company_name
  company_domain?: string;
  company_name?: string;
  company_location?: string;
  enrich_profile?: 'skip' | 'enrich';
}

export interface CompanyLookupResponse {
  url?: string;
  profile?: CompanyProfileResponse;
}

const throttle = pThrottle({
  limit: 20,
  interval: 60 * 1000,
  strict: true,
});

export class ProxyCurlClient {
  api: typeof defaultKy;

  apiKey: string;
  apiBaseUrl: string;
  _maxPageSize = 3;

  constructor({
    apiKey = process.env.PROXYCURL_KEY,
    apiBaseUrl = ProxycurlApiBaseUrl,
    timeoutMs = 30_000,
    ky = defaultKy,
  }: {
    apiKey?: string;
    apiBaseUrl?: string;
    timeoutMs?: number;
    ky?: typeof defaultKy;
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error ProxyCurlClient missing required "apiKey"`);
    }

    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl;

    const throttledKy = throttleKy(ky, throttle);

    this.api = throttledKy.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async personProfile(options: PersonProfileOptions) {
    return this.api
      .get('v2/linkedin', {
        searchParams: { ...options },
      })
      .json<PersonProfileResponse>()
      .catch(_ => undefined);
  }

  async personLookup(options: PersonLookupOptions) {
    return this.api
      .get('linkedin/profile/resolve', { searchParams: { ...options } })
      .json<PersonLookupResponse>()
      .catch(_ => undefined);
  }

  /**
   * Employee search is the recomended way to search for employees of a certain role within a specific company.
   * Se: https://nubela.co/blog/what-is-the-difference-between-the-person-search-endpoint-role-lookup-endpoint-and-the-employee-search-endpoint/
   * @returns
   */
  async personSearch(options: PersonSearchOptions) {
    return this.api
      .get('linkedin/company/employee/search/', {
        searchParams: {
          ...options,
          page_size: Math.min(
            this._maxPageSize,
            options.page_size || this._maxPageSize,
          ),
        },
      })
      .json<PersonSearchResponse>();
  }

  async companyProfile(options: CompanyProfileOptions) {
    return this.api
      .get('linkedin/company', { searchParams: { ...options } })
      .json<CompanyProfileResponse>()
      .catch(_ => undefined);
  }

  async companyLookup(options: CompanyLookupOptions) {
    return this.api
      .get('linkedin/company/resolve', {
        searchParams: { ...options },
      })
      .json<CompanyLookupResponse>()
      .catch(_ => undefined);
  }
}
