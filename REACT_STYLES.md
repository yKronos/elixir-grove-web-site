/* src/App.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Lato", sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1170px;
  margin: 0 auto;
  padding: 0 15px;
  width: 100%;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 24px;
  color: #666;
}

/* Navigation Styles */
.navigation {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1170px;
  margin: 0 auto;
  padding: 1rem 15px;
  gap: 2rem;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  font-family: "Montserrat", sans-serif;
  color: #f6692a;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  flex: 1;
  margin: 0 2rem;
}

.nav-menu button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
  font-family: "Montserrat", sans-serif;
}

.nav-menu button:hover {
  color: #f6692a;
}

.nav-auth {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-auth a,
.nav-auth button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  color: #fff;
  background-color: #f6692a;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: "Montserrat", sans-serif;
}

.nav-auth a:hover,
.nav-auth button:hover {
  background-color: #e55a1f;
}

/* Content Section Styles */
.content-section {
  padding: 80px 0;
  min-height: 600px;
  display: flex;
  align-items: center;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #222;
  font-family: "Montserrat", sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.section-header p {
  font-size: 18px;
  color: #666;
  font-family: "Lato", sans-serif;
}

/* Brands Section */
.brands-section {
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.brand-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.brand-header {
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.brand-content {
  padding: 20px;
}

.brand-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
}

.category {
  display: inline-block;
  background-color: #f6692a;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 12px;
}

.brand-content p {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.brand-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.followers {
  font-size: 13px;
  color: #999;
}

.follow-btn {
  width: 100%;
  padding: 10px;
  background-color: #f6692a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.follow-btn:hover:not(:disabled) {
  background-color: #e55a1f;
}

.follow-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Community Section */
.community-section {
  background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
}

.create-post-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.create-post-form h3 {
  margin-bottom: 20px;
  color: #222;
  font-family: "Montserrat", sans-serif;
}

.create-post-form input,
.create-post-form textarea,
.create-post-form select {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "Lato", sans-serif;
  font-size: 14px;
}

.create-post-form textarea {
  resize: vertical;
  min-height: 120px;
}

.create-post-form button {
  background-color: #f6692a;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.create-post-form button:hover:not(:disabled) {
  background-color: #e55a1f;
}

.create-post-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #d32f2f;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.community-post {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.author-info {
  display: flex;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details h4 {
  margin: 0;
  color: #222;
  font-size: 16px;
}

.timestamp {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

.category-badge {
  background-color: #f6692a;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.post-content h3 {
  margin-bottom: 10px;
  color: #222;
  font-size: 20px;
}

.post-content p {
  color: #666;
  line-height: 1.6;
}

.post-actions {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  transition: color 0.3s;
}

.like-btn:hover,
.like-btn.liked {
  color: #f6692a;
}

.comment-count {
  color: #999;
  font-size: 16px;
}

/* Auth Pages */
.auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-form h2 {
  margin-bottom: 30px;
  color: #222;
  font-family: "Montserrat", sans-serif;
  text-align: center;
}

.auth-form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: "Lato", sans-serif;
}

.auth-form button {
  width: 100%;
  padding: 12px;
  background-color: #f6692a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
}

.auth-form button:hover {
  background-color: #e55a1f;
}

.auth-form p {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.auth-form a {
  color: #f6692a;
  text-decoration: none;
}

.auth-form a:hover {
  text-decoration: underline;
}

/* Profile Page */
.profile-page {
  padding: 40px 0;
}

.profile-header {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  background: white;
  padding: 40px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-picture {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info h1 {
  margin-bottom: 10px;
  color: #222;
  font-size: 32px;
}

.bio {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.stats {
  display: flex;
  gap: 30px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat strong {
  font-size: 24px;
  color: #f6692a;
}

.stat span {
  color: #999;
  font-size: 14px;
}

.profile-activity {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-activity h2 {
  margin-bottom: 20px;
  color: #222;
  font-family: "Montserrat", sans-serif;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.activity-type {
  color: #666;
  font-weight: 600;
}

.activity-date {
  color: #999;
}

/* Footer */
#foot {
  background-color: #222;
  padding: 40px 0;
  color: #fff;
  border-top: 2px solid #f6692a;
  margin-top: auto;
}

#foot .footer-content {
  max-width: 1170px;
  margin: 0 auto;
  padding: 0 15px;
}

#foot h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #f6692a;
  font-family: "Montserrat", sans-serif;
}

#foot p {
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 24px;
}

#foot a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

#foot a:hover {
  color: #f6692a;
}

#foot .social-links {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 15px;
}

#foot .social-links li {
  display: inline-block;
}

#foot .social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid #fff;
  border-radius: 50%;
  transition: 0.3s;
}

#foot .social-links a:hover {
  border-color: #f6692a;
  background-color: #f6692a;
}

#foot .social-links i {
  color: #fff;
  font-size: 16px;
}

#foot .footer-credit {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #444;
  margin-top: 20px;
  font-size: 12px;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    flex-direction: column;
    gap: 1rem;
    margin: 0;
  }

  .section-header h2 {
    font-size: 32px;
  }

  .brands-grid {
    grid-template-columns: 1fr;
  }

  .profile-header {
    flex-direction: column;
  }

  .profile-picture {
    width: 150px;
    height: 150px;
  }

  .stats {
    width: 100%;
  }
}
