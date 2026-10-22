import React, { useEffect } from 'react';
import { useTitle } from '@/hooks/useTitle';

export interface TitleHandlerProps {
  title: string;
  description?: string;
  suffix?: string;
}

export const TitleHandler: React.FC<TitleHandlerProps> = ({
  title,
  description,
  suffix = ' | React Pro Template',
}) => {
  useTitle(title, { suffix });

  useEffect(() => {
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [description]);

  return null;
};

export default TitleHandler;
