// React Component Examples

## Home Component (src/components/Home.jsx)

```jsx
import React, { useEffect, useState } from 'react';
import { Carousel } from './Carousel';
import '../styles/home.css';

function Home() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <Carousel />
      <section className="home-intro">
        <div className="container">
          <h2>Welcome to Elixir Grove</h2>
          <p>Discover luxury fragrances and connect with fragrance enthusiasts</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
```

## Brands Component (src/components/Brands.jsx)

```jsx
import React, { useEffect, useState } from 'react';
import { brandService } from '../services/api';
import BrandCard from './BrandCard';
import '../styles/brands.css';

function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response = await brandService.getAll();
      setBrands(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading brands...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section id="brands-section" className="brands-section content-section">
      <div className="container">
        <div className="section-header">
          <h2>Our Brands</h2>
          <p>Discover our exclusive collection of luxury fragrances</p>
        </div>
        
        <div className="brands-grid">
          {brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Brands;
```

## Brand Card Component (src/components/BrandCard.jsx)

```jsx
import React, { useState } from 'react';
import { brandService } from '../services/api';

function BrandCard({ brand }) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = async () => {
    try {
      await brandService.follow(brand.id);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following brand:', error);
    }
  };

  return (
    <div className="brand-card">
      <div className="brand-header">
        <img src={brand.logo_url} alt={brand.name} className="brand-logo" />
      </div>
      <div className="brand-content">
        <h3>{brand.name}</h3>
        <p className="category">{brand.category}</p>
        <p>{brand.description}</p>
        <div className="brand-stats">
          <span className="followers">{brand.followers_count} followers</span>
        </div>
        <button 
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
          onClick={handleFollow}
          disabled={isFollowing}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
}

export default BrandCard;
```

## Community Component (src/components/Community.jsx)

```jsx
import React, { useEffect, useState } from 'react';
import { communityService } from '../services/api';
import CommunityPost from './CommunityPost';
import CreatePostForm from './CreatePostForm';
import '../styles/community.css';

function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      const response = await communityService.getPosts(page);
      setPosts(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return <div>Loading community posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <section id="community-section" className="community-section content-section">
      <div className="container">
        <div className="section-header">
          <h2>Community</h2>
          <p>Join our fragrance community and share your experiences</p>
        </div>

        <CreatePostForm onPostCreated={handlePostCreated} />

        <div className="posts-list">
          {posts.map(post => (
            <CommunityPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Community;
```

## Create Post Form (src/components/CreatePostForm.jsx)

```jsx
import React, { useState } from 'react';
import { communityService } from '../services/api';

function CreatePostForm({ onPostCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussion'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await communityService.createPost(formData);
      onPostCreated(response.data);
      setFormData({ title: '', content: '', category: 'discussion' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <h3>Share Your Thoughts</h3>
      
      <input
        type="text"
        name="title"
        placeholder="Post title..."
        value={formData.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="content"
        placeholder="What do you want to share?"
        value={formData.content}
        onChange={handleChange}
        required
        rows="5"
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
      >
        <option value="discussion">Discussion</option>
        <option value="newsletter">Newsletter</option>
        <option value="social_media">Social Media</option>
      </select>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}

export default CreatePostForm;
```

## Community Post Component (src/components/CommunityPost.jsx)

```jsx
import React, { useState } from 'react';
import { communityService } from '../services/api';

function CommunityPost({ post }) {
  const [likes, setLikes] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await communityService.unlikePost(post.id);
        setLikes(likes - 1);
      } else {
        await communityService.likePost(post.id);
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="community-post">
      <div className="post-header">
        <div className="author-info">
          <img 
            src={post.user.profile_picture || '/default-avatar.png'} 
            alt={post.user.name}
            className="avatar"
          />
          <div className="author-details">
            <h4>{post.user.name}</h4>
            <span className="timestamp">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <span className="category-badge">{post.category}</span>
      </div>

      <div className="post-content">
        <h3>{post.title}</h3>
        <p>{post.content}</p>
      </div>

      <div className="post-actions">
        <button 
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          ❤️ {likes}
        </button>
        <span className="comment-count">💬 {post.comments_count}</span>
      </div>
    </div>
  );
}

export default CommunityPost;
```

## Profile Component (src/components/Profile.jsx)

```jsx
import React, { useEffect, useState } from 'react';
import { profileService } from '../services/api';
import '../styles/profile.css';

function Profile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      const profileRes = await profileService.getProfile(userId);
      const activityRes = await profileService.getActivity(userId);
      setProfile(profileRes.data);
      setActivity(activityRes.data.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img 
          src={profile.profile_picture || '/default-avatar.png'} 
          alt={profile.name}
          className="profile-picture"
        />
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="bio">{profile.bio}</p>
          <div className="stats">
            <div className="stat">
              <strong>{profile.profile.community_posts_count}</strong>
              <span>Posts</span>
            </div>
            <div className="stat">
              <strong>{profile.profile.followers_count}</strong>
              <span>Followers</span>
            </div>
            <div className="stat">
              <strong>{profile.profile.following_count}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {activity.map(item => (
            <div key={item.id} className="activity-item">
              <span className="activity-type">{item.activity_type}</span>
              <span className="activity-date">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
```

## Navigation Component (src/components/Navigation.jsx)

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/navigation.css';

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem('token');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span>Elixir Grove</span>
        </Link>

        <ul className="nav-menu">
          <li>
            <button onClick={() => scrollToSection('home-section')}>
              Home
            </button>
          </li>
          <li>
            <button onClick={() => scrollToSection('brands-section')}>
              Brands
            </button>
          </li>
          <li>
            <button onClick={() => scrollToSection('community-section')}>
              Community
            </button>
          </li>
          <li>
            <button onClick={() => scrollToSection('about-section')}>
              About Us
            </button>
          </li>
        </ul>

        <div className="nav-auth">
          {token ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
```

## Auth Pages (src/components/Login.jsx & Register.jsx)

```jsx
// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p>Don't have an account? <a href="/register">Register here</a></p>
      </form>
    </div>
  );
}

export default Login;
```
