'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const KhetiCrewApp = dynamic(() => import('@/kheticrew/App'), { ssr: false });

export default function KhetiCrewPage() {
  return <KhetiCrewApp />;
}
