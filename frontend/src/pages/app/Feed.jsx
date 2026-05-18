import { useState, useEffect, useRef } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { feedGet, feedCreate, feedDelete, feedToggleLike, feedGetComments, feedAddComment, feedDeleteComment } from '../../api'
import { timeAgo, initials } from '../../utils'
import { useNavigate } from 'react-router-dom'

const MAX_CHARS = 500

function Avatar({ user, size = 'md' }) {
  const ini = initials(user?.name || user?.author_name || '')
  const url = user?.avatar_url || user?.author_avatar
  return (
    <div className={`avatar avatar-${size}`}>
      {url ? <img src={url} alt={user?.name || user?.author_name} /> : ini}
    </div>
  )
}

const I = ({ d, size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d={d} />
  </svg>
)
const icons = {
  heart:    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z',
  heartFill:'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z',
  comment:  'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  send:     'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  edit:     'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  more:     'M5 12h.01M12 12h.01M19 12h.01',
}

// ── Post Composer ──────────────────────────────────────────────
function PostComposer({ user, onPost }) {
  const [text, setText]     = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const ref = useRef(null)

  const submit = async () => {
    const content = text.trim()
    if (!content) return
    if (content.length > MAX_CHARS) return
    setLoading(true)
    try {
      const { data } = await feedCreate({ content })
      onPost(data.post)
      setText('')
      toast('Post published!', 'success')
    } catch {
      toast('Failed to publish post', 'error')
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX_CHARS - text.length
  const overLimit = remaining < 0

  return (
    <div className="composer">
      <div className="composer-row">
        <Avatar user={user} size="md" />
        <textarea
          ref={ref}
          className="composer-textarea"
          placeholder="What's on your mind? Share a project, question, or update…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          maxLength={MAX_CHARS + 50}
        />
      </div>
      <div className="composer-footer">
        <span className="composer-char" style={{ color: overLimit ? 'var(--error)' : remaining < 50 ? 'var(--warning)' : undefined }}>
          {remaining < MAX_CHARS ? `${remaining} chars left` : ''}
        </span>
        <button
          className="composer-submit"
          disabled={!text.trim() || overLimit || loading}
          onClick={submit}
        >
          {loading
            ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            : <><I d={icons.send} size={14} /> Post</>}
        </button>
      </div>
    </div>
  )
}

// ── Comments Section ───────────────────────────────────────────
function CommentsSection({ postId, currentUser }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [text, setText]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    feedGetComments(postId, { limit: 20 })
      .then(({ data }) => setComments(data.comments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  const submit = async () => {
    const content = text.trim()
    if (!content) return
    setSubmitting(true)
    try {
      const { data } = await feedAddComment(postId, { content })
      setComments(p => [...p, data.comment])
      setText('')
    } catch {
      toast('Failed to post comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteC = async (cid) => {
    try {
      await feedDeleteComment(postId, cid)
      setComments(p => p.filter(c => c.id !== cid))
    } catch {
      toast('Could not delete comment', 'error')
    }
  }

  if (loading) return (
    <div className="post-comments-section">
      <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    </div>
  )

  return (
    <div className="post-comments-section">
      {comments.length > 0 && (
        <div className="comment-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="avatar avatar-sm">
                {c.author_avatar ? <img src={c.author_avatar} alt={c.author_name} /> : initials(c.author_name)}
              </div>
              <div className="comment-bubble">
                <div className="comment-author">{c.author_name}</div>
                <div className="comment-text">{c.content}</div>
                <div className="comment-footer">
                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                  {currentUser?.id === c.author_id && (
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '0.7rem', padding: 0 }}
                      onClick={() => deleteC(c.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="comment-form">
        <div className="avatar avatar-sm">
          {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser.name} /> : initials(currentUser?.name)}
        </div>
        <textarea
          className="comment-input"
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        />
        <button className="comment-submit" disabled={!text.trim() || submitting} onClick={submit}>
          {submitting ? '…' : 'Reply'}
        </button>
      </div>
    </div>
  )
}

// ── Post Card ──────────────────────────────────────────────────
function PostCard({ post: initial, currentUser, onDelete }) {
  const [post, setPost]             = useState(initial)
  const [showComments, setShowComments] = useState(false)
  const [liking, setLiking]         = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const toast  = useToast()
  const navigate = useNavigate()

  const toggleLike = async () => {
    if (liking) return
    setLiking(true)
    // Optimistic update
    setPost(p => ({
      ...p,
      liked_by_me: !p.liked_by_me,
      like_count: p.like_count + (p.liked_by_me ? -1 : 1),
    }))
    try {
      await feedToggleLike(post.id)
    } catch {
      // Revert on error
      setPost(p => ({
        ...p,
        liked_by_me: !p.liked_by_me,
        like_count: p.like_count + (p.liked_by_me ? -1 : 1),
      }))
      toast('Failed to update like', 'error')
    } finally {
      setLiking(false)
    }
  }

  const doDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    try {
      await feedDelete(post.id)
      onDelete(post.id)
      toast('Post deleted', 'success')
    } catch {
      toast('Failed to delete post', 'error')
    }
  }

  const isOwn = currentUser?.id === post.author_id

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="avatar avatar-md">
          {post.author_avatar ? <img src={post.author_avatar} alt={post.author_name} /> : initials(post.author_name)}
        </div>
        <div className="post-author-info">
          <div className="post-author-name" onClick={() => navigate(`/profile/${post.author_id}`)}>
            {post.author_name}
          </div>
          <div className="post-author-meta">
            {post.author_headline && `${post.author_headline} · `}{timeAgo(post.created_at)}
          </div>
        </div>
        {isOwn && (
          <div className="dropdown">
            <button className="btn-icon" onClick={() => setMenuOpen(v => !v)}>
              <I d={icons.more} size={17} />
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item danger" onClick={() => { setMenuOpen(false); doDelete() }}>
                  <I d={icons.trash} size={14} /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-body">
        <p className="post-text">{post.content}</p>
        {post.image_url && (
          <div className="post-image">
            <img src={post.image_url} alt="Post attachment" />
          </div>
        )}
      </div>

      {(post.like_count > 0 || post.comment_count > 0) && (
        <div className="post-counts">
          {post.like_count > 0 && <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>}
          {post.comment_count > 0 && <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>}
        </div>
      )}

      <div className="post-actions">
        <button
          className={`post-action-btn${post.liked_by_me ? ' liked' : ''}`}
          onClick={toggleLike}
          disabled={liking}
        >
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}
            fill={post.liked_by_me ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round">
            <path d={icons.heart} />
          </svg>
          Like
        </button>
        <button className="post-action-btn" onClick={() => setShowComments(v => !v)}>
          <I d={icons.comment} size={16} />
          Comment
        </button>
      </div>

      {showComments && <CommentsSection postId={post.id} currentUser={currentUser} />}
    </div>
  )
}

// ── Feed Page ─────────────────────────────────────────────────
export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset]   = useState(0)
  const LIMIT = 10

  useEffect(() => { load(0, true) }, [])

  const load = async (off, reset) => {
    reset ? setLoading(true) : setLoadingMore(true)
    try {
      const { data } = await feedGet({ offset: off, limit: LIMIT })
      reset
        ? setPosts(data.posts)
        : setPosts(p => [...p, ...data.posts])
      setHasMore(data.posts.length === LIMIT)
      setOffset(off + data.posts.length)
    } catch {}
    reset ? setLoading(false) : setLoadingMore(false)
  }

  const handlePost    = (post) => setPosts(p => [{ ...post, like_count: 0, comment_count: 0, liked_by_me: false }, ...p])
  const handleDelete  = (id)   => setPosts(p => p.filter(x => x.id !== id))

  return (
    <AppLayout title="Feed">
      <div className="feed-wrap">
        <PostComposer user={user} onPost={handlePost} />

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="post-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div className="skeleton skeleton-circle" style={{ width: 36, height: 36, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ height: 12, width: '35%' }} />
                  <div className="skeleton" style={{ height: 10, width: '20%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ height: 12, width: '100%' }} />
                <div className="skeleton" style={{ height: 12, width: '80%' }} />
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Create your first post above, or connect with other developers to see their posts here.</p>
            </div>
          </div>
        ) : (
          posts.map(p => (
            <PostCard key={p.id} post={p} currentUser={user} onDelete={handleDelete} />
          ))
        )}

        {hasMore && (
          <button className="load-more" onClick={() => load(offset, false)} disabled={loadingMore}>
            {loadingMore ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, display: 'inline-block' }} /> Loading…</> : 'Load more posts'}
          </button>
        )}
      </div>
    </AppLayout>
  )
}
