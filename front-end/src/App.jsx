import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { OfferProvider } from './context/OfferContext';
import { ItemProvider } from './context/ItemContext';
import { ReviewProvider } from './context/ReviewContext';

// layout & protection
import Layout from './layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// public pages
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPasswordRequest from './pages/ResetPasswordRequest';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';

// protected pages
import Home from './pages/Home';
import MyItems from './pages/MyItems';
import ItemDetail from './pages/ItemDetail';
import MyListings from './pages/MyListings';
import MyOffers from './pages/MyOffers';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import OfferComposer from './pages/OfferComposer';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import ListingOffers from './pages/ListingOffers';
import UserReviews from './pages/UserReviews';


export default function App() {
  const { user } = useAuth?.() || {}; // prevent hook error if not wrapped yet

  return (
    <AuthProvider>
      <ReviewProvider>
        <ChatProvider>
          <OfferProvider>
            <ItemProvider>
              <Router>
              <Routes>
                {/* ---------- Public (no header) ---------- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPasswordRequest />} />
                <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />

                {/* ---------- Protected Routes (require login) ---------- */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Home />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-items"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MyItems />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/items/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ItemDetail />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Messages />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/messages/:username"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Conversation />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-listings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MyListings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/my-offers"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MyOffers />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/edit-profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EditProfile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/offer/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <OfferComposer />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-item"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AddItem />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-item/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EditItem />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listing/:id/offers"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ListingOffers />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:username/reviews"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UserReviews />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </ItemProvider>
        </OfferProvider>
      </ChatProvider>
      </ReviewProvider>
    </AuthProvider>
  );
}
