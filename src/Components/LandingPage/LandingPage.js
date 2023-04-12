import React, { useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  Button,
  List,
  ListItem,
  Popover,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import {
  HelpIcon,
  CodeBranchIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { Outlet } from 'react-router-dom';

import isBeta from '../../Utilities/isBeta';
import ImagesTable from '../ImagesTable/ImagesTable';
import './LandingPage.scss';
import DocumentationButton from '../sharedComponents/DocumentationButton';

export const LandingPage = () => {
  const [showBetaAlert, setShowBetaAlert] = useState(true);

  const toBetaContent = {
    title: "Build and launch AWS systems with custom content",
    content: <>
      <p>
        Red Hat is hard at work building tools to help you operate in an
        open hybrid cloud environment.
      </p>
      <p>
        We are currently focused on allowing you to create customized
        operating system images, deploying hosts based on these images in
        the cloud, and managing the lifecycle of these hosts. For more
        information, check out our blog post!
      </p>
      <p>
        We need your help! Please evaluate the new features in service
        preview mode and give us feedback!
      </p>
    </>,
  };

  const inBetaContent = {
    title: "Learn how to build images with custom content and launch them",
    content: <>
      <p>
        Lets help you get started on the right foor. Click on one of the
        links below to learn how to take advantage of the new features.
      </p>
      <p>
          <Title headingLevel="h4">To launch images:</Title>
          <List isPlain>
            <ListItem><Button variant='link' href='TBD'>Launch an AWS Image</Button></ListItem>
            <ListItem><Button variant='link' href='TBD'>Launch an Azure Image</Button></ListItem>
          </List>
      </p>
      <p>
          <Title headingLevel="h4">To build images with custom content:</Title>
          <List isPlain>
            <ListItem><Button variant='link' href='TBD'>Build an Image with Custom Content</Button></ListItem>
          </List>
      </p>
    </>,
  };

  const alertContent = isBeta() ? inBetaContent : toBetaContent;

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle className="title" title="Image Builder" />
        <Popover
          headerContent={'About Image Builder'}
          bodyContent={
            <TextContent>
              <Text>
                Image Builder is a service that allows you to create RHEL images
                and push them to cloud environments.
              </Text>
              <DocumentationButton />
            </TextContent>
          }
        >
          <Button
            variant="plain"
            aria-label="About image builder"
            className="pf-u-pl-sm header-button"
          >
            <HelpIcon />
          </Button>
        </Popover>
        <Popover
          headerContent={'About open source'}
          bodyContent={
            <TextContent>
              <Text>
                This service is open source, so all of its code is inspectable.
                Explore repositories to view and contribute to the source code.
              </Text>
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
                href={
                  'https://www.osbuild.org/guides/image-builder-service/architecture.html'
                }
              >
                Repositories
              </Button>
            </TextContent>
          }
        >
          <Button
            variant="plain"
            aria-label="About Open Services"
            className="pf-u-pl-sm header-button"
          >
            <CodeBranchIcon />
          </Button>
        </Popover>
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        {showBetaAlert && (
          <Alert
            className="pf-u-mb-xl"
            isInline
            variant="default"
            title={alertContent.title}
            actionClose={
              <AlertActionCloseButton onClose={() => setShowBetaAlert(false)} />
            }
            actionLinks={!isBeta() &&
              <Button
                isInline
                component="a"
                variant="link"
                href="https://console.redhat.com/beta/insights/image-builder/landing"
              >
                Go to Beta
              </Button>
            }
          >
            {alertContent.content}
          </Alert>
        )}
        <ImagesTable />
      </section>
      <Outlet />
    </React.Fragment>
  );
};

export default LandingPage;
