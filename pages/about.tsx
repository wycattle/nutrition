import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import styles from '../styles/homepage.module.scss';

export async function getStaticProps() {
  const content = fs.readFileSync(path.join(process.cwd(), 'Content', 'about.txt'), 'utf8');
  const paragraphs = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return { props: { paragraphs } };
}

export default function About({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className={styles.pageWrapper}>
        <div className={styles.outerbox} style={{ padding: '60px 60px', alignItems: 'flex-start', 
          justifyContent: 'flex-start', background: 'none' }}>
        <Link href="/" className={styles.aboutLink} style={{ position: 'absolute', top: 16, right: 24 }}>
          ← Home
        </Link>

        <h1 style={{ color: '#c6a3dd', fontWeight: 100, fontSize: 28, marginBottom: 32 }}>About this App</h1>

        <div style={{ color: '#c6a3dd', lineHeight: 1.8, maxWidth: 720, fontSize: 16 }}>
          {paragraphs.map((para, i) => (
            <p key={i} style={{ marginBottom: 20 }}>{para}</p>
          ))}
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            marginTop: 40,
            background: 'none',
            border: '1px solid #c6a3dd',
            color: '#c6a3dd',
            padding: '8px 20px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ↑ Back to top
        </button>
      </div>
    </div>
  );
}
