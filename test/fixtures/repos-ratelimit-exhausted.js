/* eslint-disable */
import nock from 'nock';
export default function fixture() {
   let scope;
   scope = nock('https://api.github.com:443', {"encodedQueryParams":true})
     .get('/users/mikedeboertest/repos')
     .query({"type":"all","sort":"updated","per_page":"100"})
     .reply(403, {"message":"API rate limit exceeded for 174.20.8.171. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)","documentation_url":"https://developer.github.com/v3/#rate-limiting"}, { server: 'GitHub.com',
     date: 'Sat, 18 Jun 2016 11:50:00 GMT',
     'content-type': 'application/json; charset=utf-8',
     'content-length': '246',
     connection: 'close',
     status: '403 Forbidden',
     'x-ratelimit-limit': '60',
     'x-ratelimit-remaining': '0',
     'x-ratelimit-reset': '1466253529',
     'x-github-media-type': 'github.v3; format=json',
     'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
     'access-control-allow-origin': '*',
     'content-security-policy': 'default-src \'none\'',
     'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
     'x-content-type-options': 'nosniff',
     'x-frame-options': 'deny',
     'x-xss-protection': '1; mode=block',
     'x-github-request-id': 'AE1408AB:EA59:14F2183:57653568' });
   return scope;
}
