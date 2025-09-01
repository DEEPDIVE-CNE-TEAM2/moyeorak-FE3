import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import JoinMembership from './pages/JoinMembership'
import Login from './pages/Login'
import Place from './pages/Place/Place'
import ClassReservation from './pages/ClassReservation/ClassReservation/ClassReservation'
import ClassReservationDetail from './pages/ClassReservation/ClassReservationDetail/ClassReservationDetail'
import Payment from './pages/ClassReservation/PaymentPage/PaymentPage'
import Announcement from './pages/Announcement/Announcement'
import AnnouncementDetail from './pages/Announcement/AnnouncementDetail/AnnouncementDetail';
import Classes from './pages/Mypage/Classes/Classes'
import Profile from './pages/Mypage/Profile/Profile'
import ChangePassword from './pages/Mypage/Profile/ChangePassword'
import ChangePhoneNumber from './pages/Mypage/Profile/ChangePhoneNumber'
import ChangeRegion from './pages/Mypage/Profile/ChangeRegion'
import WithdrawAccount from './pages/Mypage/Profile/WithdrawAccount'
import Songpa from './pages/Area/Songpa';
import Jung from './pages/Area/Jung';
import Seongdong from './pages/Area/Seongdong';
import ForgotPassword from "./pages/ForgotPassword";
import VerifyPhone from "./pages/VerifyPhone";
import Notice from "./pages/Notice/Notice/Notice";
import NoticeDetail from "./pages/Notice/NoticeDetail/NoticeDetail";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/joinMembership' element={<JoinMembership />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place' element={<Place />} />
        <Route path='/classReservation' element={<ClassReservation />} />
        <Route path='/:district/classReservation' element={<ClassReservation />} />
        <Route path='/classReservation/:id' element={<ClassReservationDetail />} />
        <Route path='/classreservation/payment/:id' element={<Payment />} />
        <Route path='/announcement' element={<Announcement />} />
        <Route path='/announcement/:id' element={<AnnouncementDetail />} />
        <Route path='/mypage/classes' element={<Classes />} />
        <Route path='/mypage/profile' element={<Profile />} />
        <Route path='/mypage/profile/password' element={<ChangePassword />} />
        <Route path='/mypage/profile/phone' element={<ChangePhoneNumber />} />
        <Route path='/mypage/profile/Region' element={<ChangeRegion />} />
        <Route path='/mypage/profile/withdraw' element={<WithdrawAccount />} />
        <Route path='/songpa' element={<Songpa />} />
        <Route path='/jung' element={<Jung />} />
        <Route path='/seongdong' element={<Seongdong />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/notice/:id" element={<NoticeDetail />} />


      </Routes>
    </BrowserRouter>
  )
}

export default App
