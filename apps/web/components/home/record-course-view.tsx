'use client';

import { useEffect, useRef } from 'react';
import { recordCourseView } from '@/lib/viewing-history';

export function RecordCourseView({
  _id,
  title,
  thumbnail,
  categoryId,
}: {
  _id: string;
  title: string;
  thumbnail?: string;
  categoryId?: string;
}) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    recordCourseView({
      id: _id,
      title,
      thumbnail,
      categoryId,
    });
  }, [_id, title, thumbnail, categoryId]);
  return null;
}
