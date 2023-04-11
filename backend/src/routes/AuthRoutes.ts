import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import SessionUtil from '@src/util/SessionUtil';
import AuthService from '@src/services/AuthService';

import { IReq, IRes } from './types/express/misc';


// **** Types **** //

interface ILoginReq {
  email: string;
  password: string;
}


// **** Functions **** //

/**
 * Login a user.
 */
async function login(req: IReq<ILoginReq>, res: IRes) {
  const { email, password } = req.body;
  // Login
  const user = await AuthService.login(email, password);
  // Setup Admin Cookie
  await SessionUtil.addSessionData(res, {
    id: user.id,
    email: user.name,
    name: user.name,
    role: user.role,
  });

  // Generate token for session (without a secret key)
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
  //set the token in the db

  // Return
  // return the token with the ok status
  return res.status(HttpStatusCodes.OK).json({ token });
}


/**
 * Logout the user.
 */
function logout(_: IReq, res: IRes) {
  SessionUtil.clearCookie(res);
  return res.status(HttpStatusCodes.OK).end();
}


// **** Export default **** //

export default {
  login,
  logout,
} as const;
