import expres  from 'express'
import {SignUp,SignIn,Logout,Conversation,ContactList} from '../controller/connection.js'
const router = expres.Router();

router.post('/signup',SignUp);
router.post('/signin',SignIn);
router.get('/logout',Logout);
router.get('/contactlist',ContactList);
// router.post('/converstation', Conversation);
router.get('/converstation/:ReceverId/:senderId', Conversation);

export default router;
