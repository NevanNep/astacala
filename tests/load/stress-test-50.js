import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const home = http.get(`${BASE_URL}/`);
  check(home, {
    "home status 200": (r) => r.status === 200,
  });

  const berita = http.get(`${BASE_URL}/berita`);
  check(berita, {
    "berita tidak error server": (r) => r.status < 500,
  });

  const login = http.get(`${BASE_URL}/login`);
  check(login, {
    "login page tidak error server": (r) => r.status < 500,
  });

  sleep(1);
}