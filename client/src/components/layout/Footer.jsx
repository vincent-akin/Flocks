import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Platform',
    links: ['Community', 'Discipleship', 'Pastoral Care', 'Attendance', 'Analytics'],
  },
  { title: 'Company', links: ['About', 'Contact'] },
  { title: 'Resources', links: ['Documentation', 'Help Center'] },
  { title: 'Legal', links: ['Privacy', 'Terms'] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background-secondary">
      <div className="container grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Know. Care. Grow.</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted transition-colors hover:text-foreground">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border-subtle py-6">
        <p className="container text-center text-xs text-muted">© 2026 Flocks. All rights reserved.</p>
      </div>
    </footer>
  );
}
