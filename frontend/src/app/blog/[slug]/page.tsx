import { Calendar, User, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  published_at: string;
  reading_time: number;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Mock blog post data - in a real app, fetch from API using the slug
  const post: BlogPost = {
    id: '1',
    title: 'Organic Farming Practices',
    slug: slug,
    excerpt: 'Learn sustainable farming techniques.',
    content: `
      <h2>Introduction to Organic Farming</h2>
      <p>Organic farming is a sustainable agricultural method that avoids synthetic chemicals and promotes natural ecosystems.</p>
      <h3>Key Benefits</h3>
      <ul>
        <li>Healthier soil</li>
        <li>Better crop quality</li>
        <li>Environmental protection</li>
        <li>Long-term sustainability</li>
      </ul>
      <h3>Best Practices</h3>
      <p>Crop rotation, composting, and natural pest control are essential practices in organic farming.</p>
    `,
    author: 'Dr. Kumar Singh',
    featured_image: 'https://via.placeholder.com/1200x600',
    category: 'Tips',
    tags: ['organic', 'farming', 'sustainability'],
    likes: 245,
    comments: 32,
    published_at: new Date('2024-01-15').toISOString(),
    reading_time: 8,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="flex items-center gap-2 text-green-300 mb-6 hover:text-green-200">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <h1 className="text-4xl font-black mb-4">{post.title}</h1>
          <p className="text-green-100">{post.excerpt}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">{post.author}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{new Date(post.published_at).toLocaleDateString()}</span>
          </div>
          <div className="text-sm text-gray-600">{post.reading_time} min read</div>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-12">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pb-12">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
            Comments ({post.comments})
          </button>
        </div>
      </div>
    </div>
  );
}
