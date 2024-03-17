import { ProxyCurlClient } from '@/services/proxycurl';
import { filterObject } from '@/lib/utils';

const proxycurl = new ProxyCurlClient();
const filterKeys = [
  'url',
  'link',
  'company_linkedin_profile_url',
  'logo_url',
  'social_networking_services',
  'profile_pic_url',
  'similarly_named_profiles',
];

export async function processLinkedInProfile(url: string) {
  console.info(`Processing LinkedIn: ${url}`);
  const res = await proxycurl.personProfile({
    linkedin_profile_url: url,
    use_cache: 'if-recent',
  });

  if (!res) {
    return;
  }

  return {
    title: `${res.full_name} : ${
      res.headline ?? res.summary ?? res.industry ?? ''
    }`,
    content: JSON.stringify(filterObject(res, filterKeys)),
  };
}
