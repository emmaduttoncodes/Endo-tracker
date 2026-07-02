import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <div className="app-header" style={{ position: 'static', padding: '4px 0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {eyebrow && <div className="app-header__eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
        </div>
        {action}
      </div>
    </div>
  );
}
