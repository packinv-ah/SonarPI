import "../Inspection/Inspection.css";

export default function Setup() {
  return (
    <div>
      <nav class="navbar navbar-expand-md">
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a
                id="navbarDropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                href="magod_setup"
              >
                Setup
              </a>
              <ul
                class="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <li class="dropdown-submenu">
                  <a class="dropdown-item dropdown-toggle" href="magod_setup">
                    Server
                  </a>
                </li>

                <li class="dropdown-submenu">
                  <a class="dropdown-item dropdown-toggle" href="magod_setup">
                    Test
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
