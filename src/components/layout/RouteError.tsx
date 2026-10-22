import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { CardBox, CustomButton } from '@/components/ui';

/** Shown inside the layout (sidebar stays visible) when a page crashes. */
export const RouteError: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';

  return (
    <div className="max-w-xl mx-auto py-12">
      <CardBox
        title="Something went wrong"
        subtitle="This page failed to render"
        icon={<AlertOctagon className="w-4 h-4 text-rose-500" />}
      >
        <div className="space-y-4">
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs font-mono text-rose-600 dark:text-rose-400">
            {message}
          </pre>
          <div className="flex gap-2">
            <CustomButton variant="primary" size="sm" onClick={() => window.location.reload()}>
              Reload page
            </CustomButton>
            <CustomButton variant="outline" size="sm" onClick={() => navigate('/')}>
              Go to start
            </CustomButton>
          </div>
        </div>
      </CardBox>
    </div>
  );
};

export default RouteError;
