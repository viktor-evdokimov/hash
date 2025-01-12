import {
  Box,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { ComponentProps, FunctionComponent, ReactNode } from "react";

import { SITE_DESCRIPTION } from "../config";
import { DiscordIcon } from "./icons/discord-icon";
import { GithubIcon } from "./icons/github-icon";
import { TwitterIcon } from "./icons/twitter-icon";
import { Link } from "./link";
import { Logo } from "./logo";
import { Spacer } from "./spacer";

const FooterLink: FunctionComponent<
  { href: string; openInNew?: boolean } & Omit<
    ComponentProps<typeof Typography>,
    "variant"
  >
> = ({ href, openInNew, sx = [], children, ...props }) => (
  <Link href={href} openInNew={openInNew}>
    <Typography
      {...props}
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
        { display: "flex", whiteSpace: "nowrap" },
      ]}
      variant="hashSmallTextMedium"
    >
      {children}
    </Typography>
  </Link>
);

const _FooterLinkWithLabel: FunctionComponent<
  ComponentProps<typeof FooterLink> & {
    type: "open" | "fair";
  }
> = ({ type, children, ...props }) => {
  return (
    <FooterLink {...props}>
      <Box component="span" position="relative">
        {children}
        <Typography
          sx={[
            (theme) => theme.typography.hashSmallCaps,
            {
              color: type === "open" ? "purple.600" : "blue.700",
            },
            (theme) => ({
              [theme.breakpoints.up("sm")]: {
                position: "absolute",
                left: "100%",
                top: "50%",
                transform: `translateX(${theme.spacing(1)}) translateY(-50%)`,
              },
              [theme.breakpoints.down("sm")]: {
                display: "block",
              },
            }),
          ]}
          component="span"
        >
          {type[0]!.toUpperCase() + type.slice(1)} Source
        </Typography>
      </Box>
    </FooterLink>
  );
};

export const FooterSection: FunctionComponent<{
  children?: ReactNode;
  label: ReactNode;
}> = ({ label, children }) => (
  <Stack spacing={2}>
    <Stack spacing={1}>
      <Typography variant="hashFooterHeading">{label}</Typography>
      <Divider sx={{ borderColor: "gray.30" }} />
    </Stack>
    {children}
  </Stack>
);

export const Footer: FunctionComponent = () => (
  <Box
    component="footer"
    sx={{
      py: {
        xs: 6,
        lg: 8,
      },
      background: "linear-gradient(359.56deg, #FFFFFF 59.36%, #F7F8FA 99.57%)",
      boxShadow: "0px -2px 16px rgba(36, 189, 224, 0.21)",
      borderTop: 4,
      borderColor: "white",

      "& a:hover": {
        bgcolor: "transparent",
      },
    }}
  >
    <Container>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 6, md: 10 }}
      >
        <Stack>
          <Logo />
          <Spacer y={2} sm={{ y: 3 }} />
          <Typography
            sx={{ width: { xs: 1, md: 289 }, mb: 4.5 }}
            variant="hashSmallText"
          >
            {SITE_DESCRIPTION}
          </Typography>
          <Typography variant="hashSocialIconLink">
            <Stack direction="row" spacing={3}>
              <Link href="https://github.com/hashintel/hash">
                <GithubIcon fontSize="inherit" />
              </Link>
              <Link href="https://twitter.com/hashintel">
                <TwitterIcon fontSize="inherit" />
              </Link>
              <Link href="https://hash.ai/discord">
                <DiscordIcon fontSize="inherit" />
              </Link>
            </Stack>
          </Typography>
        </Stack>
        <Grid
          container
          width="100%"
          spacing={{ xs: 0, md: 3 }}
          gap={{ xs: 3, md: 0 }}
          justifyContent={{ xs: "space-between", sm: "flex-start" }}
        >
          <Grid item lg={4} md={6}>
            <FooterSection label="Resources">
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/roadmap">Roadmap</FooterLink>
              {/* @todo: add docs pages */}
              {/* <FooterLink href="/docs">Docs</FooterLink> */}
              {/* @todo: add tutorials pages */}
              {/* <FooterLink href="/tutorials">Tutorials</FooterLink> */}
            </FooterSection>
          </Grid>
          <Grid item lg={4} md={6}>
            <FooterSection label="Projects">
              <FooterLink href="https://blockprotocol.org">
                <Box
                  component="span"
                  sx={{
                    color: ({ palette }) => palette.purple[60],
                    fontWeight: 700,
                    marginRight: 1,
                  }}
                >
                  Þ
                </Box>
                Block Protocol
              </FooterLink>
              <FooterLink href="https://hash.ai">
                <Box
                  component="span"
                  sx={{
                    color: ({ palette }) => palette.blue[70],
                    fontWeight: 700,
                    marginRight: 1,
                  }}
                >
                  #
                </Box>
                HASH
              </FooterLink>
              {/* @todo: add docs page */}
              {/* <FooterLink href="/docs/getting-started">
                <Box component="span" sx={{ marginRight: 1 }}>
                  <FaIcon
                    name="chevron-right"
                    type="solid"
                    sx={{
                      color: ({ palette }) => palette.teal[50],
                      fontSize: 14,
                    }}
                  />
                </Box>
                See all projects
              </FooterLink> */}
            </FooterSection>
          </Grid>
          <Grid item lg={4} md={6}>
            <FooterSection label="Get Involved">
              {/* @todo: add docs page */}
              {/* <FooterLink href="/docs/getting-started">Getting started</FooterLink> */}
              {/* @todo: fix href */}
              {/* <FooterLink href="/">Contribute</FooterLink> */}
              <FooterLink href="https://hash.ai/contact">Contact Us</FooterLink>
            </FooterSection>
          </Grid>
        </Grid>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          columnGap: 3,
          marginTop: 2,
          "> a > p": {
            fontSize: 12,
            textTransform: "uppercase",
            color: ({ palette }) => palette.gray[50],
          },
        }}
      >
        <FooterLink href="https://hash.ai/legal/privacy" openInNew>
          Privacy
        </FooterLink>
        <FooterLink href="https://hash.ai/legal/terms" openInNew>
          Legal
        </FooterLink>
      </Box>
    </Container>
  </Box>
);
