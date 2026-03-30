import { SITE_NAME } from "../../constants/site";

const Footer = () => {
  return (
    <footer
      id="contact"
      className="border-t border-emerald-200/70 bg-emerald-900 px-4 py-6 text-center text-sm font-medium text-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
    >
      <p>(c) 2026 {SITE_NAME}. Built for waste management and recycling services.</p>
    </footer>
  );
};

export default Footer;
