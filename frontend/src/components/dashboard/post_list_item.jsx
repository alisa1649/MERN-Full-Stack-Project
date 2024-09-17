import React from 'react';
import { Link } from 'react-router-dom';
import { createNewVoteOnPost, deleteParentPost } from '../../actions/parent_post_actions';
import { connect } from 'react-redux';
import { getOtherUserInfo } from '../../actions/user_actions';

class PostListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            votes: Object.values(this.props.post.votes),
            upvotes: [],
            downvotes: [],
        };
        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleDownvote = this.handleDownvote.bind(this);
    }
    componentDidMount() {
        this.props.getOtherUserInfo(this.props.post.user);
        this.setState((oldState) => {
            const upvotes = oldState.votes.filter((vote) => vote === 'upvote');
            const downvotes = oldState.votes.filter((vote) => vote === 'downvote');
            return {
                upvotes,
                downvotes,
                upvoteNum: upvotes.length,
                downvoteNum: downvotes.length,
            };
        });
        if (this.props.currentUserId in this.props.post.votes) {
            if (this.props.post.votes[this.props.currentUserId] === 'upvote') {
                this.isUpvoted = true;
                this.isDownvoted = false;
            } else if (this.props.post.votes[this.props.currentUserId] === 'downvote') {
                this.isDownvoted = true;
                this.isUpvoted = false;
            }
        }
    }
    componentDidUpdate(oldProps) {
        if (oldProps !== this.props) {
            const votes = Object.values(this.props.post.votes);
            const upvotes = votes.filter((vote) => vote === 'upvote');
            const downvotes = votes.filter((vote) => vote === 'downvote');
            this.setState({
                votes,
                upvotes,
                downvotes,
                upvoteNum: upvotes.length,
                downvoteNum: downvotes.length,
            });

            if (this.props.currentUserId in this.props.post.votes) {
                if (this.props.post.votes[this.props.currentUserId] === 'upvote') {
                    this.isUpvoted = true;
                    this.isDownvoted = false;
                } else if (this.props.post.votes[this.props.currentUserId] === 'downvote') {
                    this.isDownvoted = true;
                    this.isUpvoted = false;
                }
            } else {
                this.isDownvoted = false;
                this.isUpvoted = false;
            }
        }
    }
    handleUpvote(e) {
        e.preventDefault();

        this.props.voteAction(this.props.post._id, {
            userId: this.props.currentUserId,
            type: 'upvote',
        });
    }

    handleDownvote(e) {
        e.preventDefault();

        this.props.voteAction(this.props.post._id, {
            userId: this.props.currentUserId,
            type: 'downvote',
        });
    }

    render() {
        const post = this.props.post;
        const editAction = this.props.editAction;
        const deleteAction = this.props.deleteAction;
        const isParentPost = !post.parent;
        const timestamp = post.createdAt;

        const belongsToUser = this.props.currentUserId === post.user;

        let userId = post.user;
        const author = this.props.users[userId];

        if (!post || !author) {
            return <div>No posts found</div>;
        }

        return (
            <Link to={isParentPost ? `/thread/${post._id}` : null}>
                <li className={this.props.klassName}>
                    <div className="post-body">
                        <div id={author.img_bg_color} className="post-profile-pic">
                            <img src={author.image_path} alt="profile-pic" />
                        </div>
                        <div className="post-details">
                            <div className="username-box">
                                {post.anonymity ? (
                                    <p>Anonymous says</p>
                                ) : (
                                    <p>
                                        <Link id="author-link" to={`/users/${author.id}`}>
                                            {author.username}
                                            {'  '}
                                        </Link>
                                        says
                                    </p>
                                )}
                            </div>
                            <p>{post.text}</p>
                            <div className="vote-box">
                                <div
                                    className={this.isUpvoted ? 'pressed' : 'unpressed'}
                                    id="upvote"
                                    onClick={(e) => this.handleUpvote(e)}>
                                    <i className="fas fa-arrow-alt-circle-up"></i>
                                    <p>{this.state.upvoteNum}</p>
                                </div>
                                <div
                                    className={this.isDownvoted ? 'pressed' : 'unpressed'}
                                    id="downvote"
                                    onClick={(e) => this.handleDownvote(e)}>
                                    <i className="fas fa-arrow-alt-circle-down"></i>
                                    <p>{this.state.downvoteNum}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                <div className="buttons-timestamps-container">
                    <div className="post-body-buttons">
                        {belongsToUser && !!editAction ? (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    editAction(post);
                                }}>
                                Edit
                            </button>
                        ) : (
                            ''
                        )}
                        {belongsToUser && !!deleteAction ? (
                            <button
                                className="delete-button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    deleteAction(post._id);
                                }}>
                                Delete
                            </button>
                        ) : (
                            ''
                        )}
                    </div>
                    <div className="post-timestamps">
                        Posted: {new Date(timestamp).toLocaleString([], {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
                </li>
            </Link>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentUserId: state.session.user.id,
        users: state.entities.users,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getOtherUserInfo: (userId) => dispatch(getOtherUserInfo(userId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(PostListItem);
