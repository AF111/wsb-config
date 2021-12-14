<script>

    import { Link } from "svelte-routing";
  
    export let to = "";
    export let className = "";

    function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
      const isActive = href === "/" ? isCurrent : isPartiallyCurrent || isCurrent;
  
      if (isActive) {
        return { class: (className ? className + " " : "") + "active" };
      }
      return {};
    }
  </script>
  
  <Link to="{to}" getProps="{getProps}">
    <slot />
  </Link>