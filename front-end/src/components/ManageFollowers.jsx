import { useEffect,useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import styles from './ManageFollowers.module.css';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDot,faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from './UserContext';
import ShortProfileByUserId from './ShortProfileByUserId';

const ManageFollowers = ({ name, ...props }) => {
  const {followerIds: initialFollowerIds, removeFollower} = useContext(UserContext);
  
  const [followerIds, setFollowerIds] = useState(initialFollowerIds);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setFollowerIds(initialFollowerIds);
  }, [initialFollowerIds]);


  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);

  const handleRemoveFollower = async (followerId) => {
    try{
      console.log('Follower Id' + followerId);
      const removeResponse = await axios.delete(`/api/users/remove-follower/${followerId}`);
      console.log(removeResponse.data);
      removeFollower(followerId);
      setFollowerIds((prevFollowerIds) => prevFollowerIds.filter(f => f !== followerId));
      console.log(followerIds);
    }catch(err){
      console.log('Error while removing follower: '+err);
    }
  }

  return (
    <>
    <div className={styles.container}>
      <Button variant="" onClick={toggleShow} >
        <div className={styles.text}>
          <h3>{name}</h3>
        </div>
      </Button>
      <Offcanvas show={show} onHide={handleClose} {...props} className={styles.offCanvas}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Manage Followers</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
        {
          followerIds.map((followerId) => (
            <div className={styles.userCard}>
              <div key={followerId} className={styles.userProfile}>
                <ShortProfileByUserId userId={followerId} />
              </div>
              <div className={styles.removeFollower}>
                <button onClick={() => handleRemoveFollower(followerId)}>
                  <FontAwesomeIcon icon={faUserSlash} />
                </button>
              </div>
            </div>
          ))
        }
        </Offcanvas.Body>
      </Offcanvas>
    </div>
    </>
  );
}

export default ManageFollowers;