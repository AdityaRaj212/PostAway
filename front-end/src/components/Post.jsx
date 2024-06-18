import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import styles from './Post.module.css';
import ProfileImg from './ProfileImg';
import AddComment from './AddComment';
import ShowComments from './ShowComments';
import ShortProfile from './ShortProfile';
import FollowButton from './FollowButton';
import { UserContext } from './UserContext';
import { PlaceholderBox } from './Home';
import { AuthContext } from './AuthContext';

const PostBox = ({post,fetchPosts})=>{
    const {isAuth} = useContext(AuthContext);

    const {userId} = useContext(UserContext);
    const currUserId = userId;

    const [currUser,setCurrUser] = useState(null);
    const [user,setUser] = useState(null);
    const [likes,setLikes] = useState(0);
    const [liked,setLiked] = useState(false);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);
    const [showCommentField,setShowCommentField] = useState(false);
    const [showAllComments,setShowAllComments] = useState(false);
    const [comments,setComments] = useState([]);  
    const addCommentRef = useRef(null);
    const showCommentsRef = useRef(null);

    const handleLike = async () => {
        const likeResp = await axios.get(`/api/likes/toggle/${post.postId}`); 
        
        const likeResponse = await axios.get(`/api/likes/likes-for-a-post/${post.postId}`);
        setLikes(likeResponse.data);

        setLiked(!liked);
    }

    const handleAddComment = () => {
        setShowCommentField(!showCommentField);
    }

    const handleShowComments = () => {
        setShowAllComments(!showAllComments);
    }

    const commentPosted = async () => {
        const commentsResponse = await axios.get(`/api/comments/${post.postId}`);
        console.log(commentsResponse.data);
        setComments(commentsResponse.data);
    }

    useEffect(()=>{
        const fetchDetails = async ()=>{
            try{
                const userResponse = await axios.get(`/api/posts/user/${post.postId}`);
                setUser(userResponse.data);
                
                const likeResponse = await axios.get(`/api/likes/likes-for-a-post/${post.postId}`);
                setLikes(likeResponse.data);

                const likedResponse = await axios.get(`/api/likes/is-liked-by-user/${post.postId}`);
                // console.log(`Post Id: ${post.postId}` + likedResponse.data);
                setLiked(likedResponse.data);

                const commentsResponse = await axios.get(`/api/comments/${post.postId}`);
                setComments(commentsResponse.data);

                // const currUserResponse = await axios.get('/api/users/get-user-id-of-logged-in-user');
                // setCurrUser(currUserResponse.data);

                const userInfo = Cookies.get('userInfo');
                setCurrUser(JSON.parse(userInfo));

                setLoading(false);
            }catch(err){
                setError(err);
                setLoading(false);
            }
        };
        if(isAuth){
            fetchDetails();
        }
        // console.log(user);
    },[]);

    useEffect(() => {
        if (addCommentRef.current) {
            if (showCommentField) {
                addCommentRef.current.classList.add('show');
                addCommentRef.current.classList.remove('hidden');
            } else {
                addCommentRef.current.classList.add('hidden');
                addCommentRef.current.classList.remove('show');
            }
        }
    }, [showCommentField]);

    useEffect(() => {
        if (showCommentsRef.current) {
            if (showAllComments) {
                showCommentsRef.current.classList.add(styles.show);
                showCommentsRef.current.classList.remove(styles.hidden);
            } else {
                showCommentsRef.current.classList.add(styles.hidden);
                showCommentsRef.current.classList.remove(styles.show);
            }
        }
    }, [showAllComments]);

    if(loading){
        return <PlaceholderBox/>;
    }
    if(error){
        return <div>Error while loading the post</div>;
    }
    if(!user){
        return <div>User not found!</div>
    }
    return(
        <>
            <div className={`card ${styles.postContainer}`}>

                {/* <div className={styles.userInfo}>
                    <ProfileImg user={user} />
                    <div className={styles.userName}>
                        {user.name}
                    </div>
                </div> */}
                <div className={styles.userInfo}>
                    <ShortProfile user={user}/>
                    {
                        currUserId!=user.userId 
                        &&
                        (
                            <FollowButton user={user} fetchPosts={fetchPosts}/>
                        )
                    }
                </div>

                {post.imagePath !== '' && (
                    <div className={styles.imageContainer}>
                        <img src={post.imagePath} className={`card-img-top ${styles.image}`} alt="Post Image" />
                    </div>
                )}

                <div className={`card-body content`}>
                    <p className={`card-text`}>{post.caption}</p>
                </div>

                <div className={styles.infoAndButtons}>
                    <div className={styles.info}>
                        Likes : {likes.length}
                    </div>
                    <div className={styles.buttons}>
                        <button className={`btn btn-link ${styles.likeButton} ${styles.heartButton}`} onClick={handleLike}>
                            {/* <FontAwesomeIcon icon={faHeart} className={liked? styles.liked : ''} /> */}
                            {liked? 
                            <FontAwesomeIcon icon={faHeart} style={{color: "red"}} />
                            :
                            <FontAwesomeIcon icon={faHeart} style={{color: "grey"}} />
                            }
                        </button>
                        <button className={styles.btnPrimary} onClick={handleAddComment}>Add a comment</button>
                    </div>
                </div>

                <div ref={addCommentRef} className={`${styles.addComment} ${showCommentField ? `${styles.show}` : `${styles.hidden}`}`}>
                    {showCommentField && <AddComment postId={post.postId} onCommentPosted={commentPosted}/>}
                </div>

                <div className={styles.showComments}>
                    <button className={`btn`} onClick={handleShowComments}>
                        {showAllComments && <div>Hide all comments...</div>}
                        {!showAllComments && <div>Show all comments...</div>}
                        {/* Show all comments... */}
                    </button>
                    <div ref={showCommentsRef} className={`${styles.showCommentsContainer} ${showAllComments ? `${styles.show}` : `${styles.hidden}`}`}>
                        {showAllComments && <ShowComments comments={comments} />}
                    </div>
                </div>
            </div>
        </>
    )
}

export default PostBox;