import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';

const PublicLayout = () => {
  useEffect(() => {
    // Load Bootstrap CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/bootstrap/bootstrap.min.css';
    css.id = 'bootstrap-css';

    // Load Bootstrap JS
    const js = document.createElement('script');
    js.src = '/bootstrap/bootstrap.bundle.min.js';
    js.id = 'bootstrap-js';

    document.head.appendChild(css);
    document.body.appendChild(js);

    return () => {
      document.getElementById('bootstrap-css')?.remove();
      document.getElementById('bootstrap-js')?.remove();
    };
  }, []);

  return <Outlet />;
};

export default PublicLayout;
