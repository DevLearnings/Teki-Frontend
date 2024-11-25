import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const TekiLandingPage = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const menuStyles = {
    button: {
      bg: "transparent",
      _hover: { bg: "gray.100" },
      _active: { bg: "gray.200" },
      fontWeight: "medium",
      fontSize: "sm",
      color: "#0e161b",
    },
    list: {
      bg: "white",
      boxShadow: "md",
      borderRadius: "md",
      border: "1px solid",
      borderColor: "gray.200",
      mt: 2,
    },
    item: {
      _hover: { bg: "gray.100" },
      _focus: { bg: "gray.100" },
      fontSize: "sm",
      fontWeight: "medium",
      color: "#0e161b",
    },
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fafb] group/design-root overflow-x-hidden font-manrope">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e8eef3] px-10 py-3">
        <div className="flex items-center gap-4 text-[#0e161b]">
          <div className="size-4">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-[#0e161b] text-lg font-bold leading-tight tracking-[-0.015em]">
            Teki
          </h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                onClick={() => toggleMenu('investors')}
                {...menuStyles.button}
              >
                For investors
              </MenuButton>
              <MenuList {...menuStyles.list}>
                <MenuItem as={Link} to="/investoreg" {...menuStyles.item} style={{margin:"40px"}}>Sign up</MenuItem>
                <MenuItem as={Link} to="/investorlog" {...menuStyles.item} style={{margin:"40px"}}>Log in</MenuItem>
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                onClick={() => toggleMenu('pitchers')}
                {...menuStyles.button}
              >
                For pitchers
              </MenuButton>
              <MenuList {...menuStyles.list}>
                <MenuItem as={Link} to="/pitchereg" {...menuStyles.item} style={{margin:"40px"}}>Sign up</MenuItem>
                <MenuItem as={Link} to="/pitcherlog" {...menuStyles.item} style={{margin:"40px"}}>Log in</MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
      </header>
      
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="max-w-[960px]">
          <div className="flex flex-col gap-6 px-4 py-10 md:flex-row md:gap-8 lg:px-0">
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl md:h-auto md:min-w-[400px] lg:w-full"
              style={{
                backgroundImage:
                  'url("https://cdn.usegalileo.ai/sdxl10/070e2e0f-c40e-42be-9085-d0f6764d316a.png")',
              }}
            ></div>
            <div className="flex flex-col gap-6 md:min-w-[400px] md:gap-8 md:justify-center">
              <div className="flex flex-col gap-2 text-left">
                <h1 className="text-[#0e161b] text-4xl font-black leading-tight md:text-5xl md:font-black md:leading-tight">{`Find the right investors for your startup`}</h1>
                <h2 className="text-[#0e161b] text-sm font-normal leading-normal md:text-base md:font-normal md:leading-normal">{`We help innovative companies get the funding they need to grow by connecting them with savvy investors.`}</h2>
              </div>
              <Button
                as={Link}
                to="/getstarted"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 md:h-12 md:px-5 bg-[#187fbf] text-[#f8fafb] text-sm font-bold leading-normal tracking-[0.015em] md:text-base md:font-bold md:leading-normal md:tracking-[0.015em]"
              >
                <span className="truncate">Get started</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-10 px-4 py-10 md:gap-10">
            <div className="flex flex-col gap-4">
              <h1 className="text-[#0e161b] tracking-light text-[32px] font-bold leading-tight md:text-4xl md:font-black md:leading-tight md:tracking-[-0.033em] max-w-[720px]">{`Pitch your startup in 4 steps`}</h1>
              <p className="text-[#0e161b] text-base font-normal leading-normal max-w-[720px]">{`Whether you're raising your first round or your last, we're here to help you at every stage.`}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://cdn.usegalileo.ai/sdxl10/df1349e8-0bc7-4aa6-8c9c-f3968deafaa8.png")',
                  }}
                ></div>
                <div>
                  <p className="text-[#0e161b] text-base font-medium leading-normal">{`Create a profile`}</p>
                  <p className="text-[#4f7b96] text-sm font-normal leading-normal">{`Tell us about your company, and what you're looking for.`}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://cdn.usegalileo.ai/sdxl10/109296d3-3af1-48fa-a09c-dd3dd01f3aad.png")',
                  }}
                ></div>
                <div>
                  <p className="text-[#0e161b] text-base font-medium leading-normal">{`Post a pitch`}</p>
                  <p className="text-[#4f7b96] text-sm font-normal leading-normal">{`Create a pitch video, slide deck, or both. We'll help you put your best foot forward.`}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://cdn.usegalileo.ai/sdxl10/865f6648-2230-45fe-afa0-c0486a121449.png")',
                  }}
                ></div>
                <div>
                  <p className="text-[#0e161b] text-base font-medium leading-normal">{`Get matched`}</p>
                  <p className="text-[#4f7b96] text-sm font-normal leading-normal">{`Once your pitch is live, we'll match you with investors who are interested in your space.`}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-3">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl"
                  style={{
                    backgroundImage:
                      'url("https://cdn.usegalileo.ai/replicate/54990354-5159-4a0d-a50e-87061c5e79ba.png")',
                  }}
                ></div>
                <div>
                  <p className="text-[#0e161b] text-base font-medium leading-normal">{`Get funded`}</p>
                  <p className="text-[#4f7b96] text-sm font-normal leading-normal">{`When an investor likes your pitch, they can invest on the spot.`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex justify-center">
        <div className="max-w-[960px] flex-1 flex-col">
          <footer className="flex flex-col gap-6 px-5 py-10 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 md:flex-row md:justify-around">
              <Link
                to="#"
                className="text-[#4f7b96] text-base font-normal leading-normal min-w-40"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                className="text-[#4f7b96] text-base font-normal leading-normal min-w-40"
              >
                Terms of Service
              </Link>
              <Link
                to="#"
                className="text-[#4f7b96] text-base font-normal leading-normal min-w-40"
              >
                Help
              </Link>
              <Link
                to="#"
                className="text-[#4f7b96] text-base font-normal leading-normal min-w-40"
              >
                Contact Us
              </Link>
            </div>
          </footer>
        </div>
      </footer>
    </div>
  );
};

export default TekiLandingPage;