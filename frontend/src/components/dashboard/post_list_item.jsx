import React from 'react';
import { Link } from 'react-router-dom';
import { deleteParentPost } from '../../actions/parent_post_actions';
import { connect } from 'react-redux';
import { getOtherUserInfo } from '../../actions/user_actions';
import { createNewVote, deleteVote, requestVotesOnPost } from '../../actions/vote_actions';

class PostListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            votes: [],
            upvotes: [],
            downvotes: [],
            upvoteNum: 0,
            downvoteNum: 0,
        };
        this.toggleUpvoteClick = this.toggleUpvoteClick.bind(this);
        this.toggleDownvoteClick = this.toggleDownvoteClick.bind(this);
    }
    componentDidMount() {
        this.props.getOtherUserInfo(this.props.post.user);
        this.props.requestVotesOnPost(this.props.post._id);

        this.setState({
            upvotes: this.props.votes.filter((vote) => vote.type === 'upvote' && vote.post === this.props.post._id),
            downvotes: this.props.votes.filter((vote) => vote.type === 'downvote' && vote.post === this.props.post._id),
            upvoteNum: this.state.upvotes.length,
            downvoteNum: this.state.downvotes.length,
        });
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.votes !== this.props.votes) {
            // debugger;
            this.setState({
                upvotes: this.props.votes.filter((vote) => vote.type === 'upvote' && vote.post === this.props.post._id),
                downvotes: this.props.votes.filter(
                    (vote) => vote.type === 'downvote' && vote.post === this.props.post._id
                ),
                upvoteNum: this.state.upvotes.length,
                downvoteNum: this.state.downvotes.length,
            });

            if (this.state.upvotes.filter((vote) => vote.user === this.props.currentUserId).length > 0) {
                console.log('is upvoted!');
                this.isUpvoted = true;
                this.isDownvoted = false;
            } else if (this.state.downvotes.filter((vote) => vote.user === this.props.currentUserId).length > 0) {
                console.log('is downvoted!');
                this.isDownvoted = true;
                this.isUpvoted = false;
            } else {
                console.log('no votes');
            }
            console.log(this.state.upvoteNum, ' ', this.state.downvoteNum);
        }
    }
    handleUpvote() {
        this.props.createNewVote({
            type: 'upvote',
            user: this.props.currentUserId,
            post: this.props.post._id,
        });
    }
    handleDownvote() {
        this.props.createNewVote({
            type: 'downvote',
            user: this.props.currentUserId,
            post: this.props.post._id,
        });
    }
    toggleUpvoteClick() {
        let upvoteButton = document.getElementById('upvote');
        let downvoteButton = document.getElementById('downvote');

        if (upvoteButton.className === 'unpressed') {
            this.handleUpvote();
            this.setState({
                upvoteNum: this.state.upvoteNum + 1,
            });
            //checks if user already downvoted, takes away if they have.
            if (downvoteButton.className === 'pressed') {
                this.setState({
                    downvoteNum: this.state.downvoteNum - 1,
                });
            }
            upvoteButton.className = 'pressed';
            downvoteButton.className = 'unpressed';
        } else {
            //delete vote here
            let delVote = this.props.votes.find((vote) => {
                if (vote.user === this.props.currentUserId && vote.post === this.props.post.id) {
                    return true;
                }
            });
            if (delVote) {
                this.props.deleteVote(delVote.id);
                this.setState({
                    upvoteNum: this.state.upvoteNum - 1,
                });
            }

            upvoteButton.className = 'unpressed';
        }
    }

    toggleDownvoteClick() {
        let upvoteButton = document.getElementById('upvote');
        let downvoteButton = document.getElementById('downvote');
        if (downvoteButton.className === 'unpressed') {
            this.handleDownvote();
            // increases downvoteNum by one
            this.setState({
                downvoteNum: this.state.downvoteNum + 1,
            });
            //checks if user has already voted, takes away upvote if they have.
            if (upvoteButton.className === 'pressed') {
                this.setState({
                    upvoteNum: this.state.upvoteNum - 1,
                });
            }

            upvoteButton.className = 'unpressed';
            downvoteButton.className = 'pressed';
        } else {
            //delete vote here
            let delVote = this.props.votes.find((vote) => {
                if (vote.user === this.props.currentUserId && vote.post === this.props.post.id) {
                    return true;
                }
            });
            if (delVote) {
                this.props.deleteVote(delVote.id);

                this.setState({
                    downvoteNum: this.state.downvoteNum - 1,
                });
            }
            downvoteButton.className = 'unpressed';
        }
    }
    render() {
        const post = this.props.post;
        const editAction = this.props.editAction;
        const deleteAction = this.props.deleteAction;
        const isParentPost = !post.parent;

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
                                            {author.username}{' '}
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
                                    onClick={() => this.toggleUpvoteClick()}>
                                    <i className="fas fa-arrow-alt-circle-up"></i>
                                    <p>{this.state.upvoteNum}</p>
                                </div>
                                <div
                                    className={this.isDownvoted ? 'pressed' : 'unpressed'}
                                    id="downvote"
                                    onClick={() => this.toggleDownvoteClick()}>
                                    <i className="fas fa-arrow-alt-circle-down"></i>
                                    <p>{this.state.downvoteNum}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="post-body-buttons">
                        {belongsToUser && !!editAction ? (
                            <button onClick={() => editAction(post._id)}>Edit</button>
                        ) : (
                            ''
                        )}
                        {belongsToUser && !!deleteAction ? (
                            <button className="delete-button" onClick={() => deleteAction(post._id)}>
                                Delete
                            </button>
                        ) : (
                            ''
                        )}
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
        votes: Object.values(state.entities.votes),
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getOtherUserInfo: (userId) => dispatch(getOtherUserInfo(userId)),
        createNewVote: (vote) => dispatch(createNewVote(vote)),
        deleteVote: (voteId) => dispatch(deleteVote(voteId)),
        requestVotesOnPost: (postId) => dispatch(requestVotesOnPost(postId)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(PostListItem);
