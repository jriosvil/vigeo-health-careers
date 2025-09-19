import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileDetector = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if user is already on a mobile route
    const isOnMobileRoute = location.pathname.startsWith('/mobile');
    
    // Add or remove mobile class from body
    if (isOnMobileRoute) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }
    
    // If mobile user is not on mobile route, redirect to mobile version
    if (isMobile && !isOnMobileRoute) {
      // Map desktop routes to mobile routes
      const routeMap = {
        '/': '/mobile/jobs',
        '/jobs': '/mobile/jobs',
        '/login': '/mobile/login',
        '/signup': '/mobile/signup',
        '/my-applications': '/mobile/applications'
      };
      
      // Handle job details routes
      const jobDetailsMatch = location.pathname.match(/^\/jobs\/(.+)$/);
      if (jobDetailsMatch) {
        navigate(`/mobile/jobs/${jobDetailsMatch[1]}`, { replace: true });
        return;
      }
      
      const mobileRoute = routeMap[location.pathname] || '/mobile/jobs';
      navigate(mobileRoute, { replace: true });
    }
  }, [location.pathname, navigate]);

  return children;
};

export default MobileDetector;