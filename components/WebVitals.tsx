'use client';

import { useReportWebVitals } from 'next/web-vitals';

function WebVitals() {
  useReportWebVitals(metric => {
    console.log(metric);
  });

  return null;
}

export default WebVitals;
