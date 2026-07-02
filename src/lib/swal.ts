import Swal from "sweetalert2";

const getThemeConfig = () => {
  if (typeof document === "undefined") return {};
  const isDark = document.documentElement.getAttribute("data-mui-color-scheme") === "dark";

  return {
    theme: isDark ? "dark" : "light",
    background: isDark ? "#2f3349" : "#ffffff"
  };
};

const swal = Swal.mixin({
  confirmButtonColor: "#009541",
  cancelButtonColor: "#d33",
  showCancelButton: true,
  cancelButtonText: "Cancelar"
});

const originalFire = swal.fire.bind(swal);

swal.fire = (options: any) => originalFire({ ...getThemeConfig(), ...options });

export default swal;
