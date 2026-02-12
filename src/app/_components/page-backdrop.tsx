export function PageBackdrop() {
  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-elephants.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-brand-cream/95" />
    </>
  );
}
