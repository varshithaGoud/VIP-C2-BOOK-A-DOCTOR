import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const listenersRef = useRef([]);

  // Subscribe to real-time notifications
  const subscribeToNotifications = (callback) => {
    listenersRef.current.push(callback);
    return () => {
      listenersRef.current = listenersRef.current.filter((cb) => cb !== callback);
    };
  };

  useEffect(() => {
    let socketInstance = null;

    if (user && user._id) {
      // Connect socket
      socketInstance = io('http://localhost:5001');
      
      socketInstance.on('connect', () => {
        console.log('Connected to real-time notification socket');
        socketInstance.emit('register', user._id);
      });

      socketInstance.on('notification', (notification) => {
        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Display toast alert
        toast.info(
          <div className="flex flex-col">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
              {notification.title}
            </span>
            <span className="text-sm font-medium mt-1">
              {notification.message}
            </span>
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored'
          }
        );

        // Broadcast to React page listeners
        listenersRef.current.forEach((callback) => callback(notification));
      });

      setSocket(socketInstance);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount, subscribeToNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
