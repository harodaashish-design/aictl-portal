import AicteHeader from '../components/AicteHeader';
import AicteNavbar from '../components/AicteNavbar';
import AicteFooter from '../components/AicteFooter';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <AicteHeader />
      <AicteNavbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <AicteFooter />
    </div>
  );
}
