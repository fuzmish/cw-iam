import { FaMemory } from "react-icons/fa6"
import { Panel, PanelGroup } from "react-resizable-panels"
import { Link } from "react-router-dom"

export function About() {
  return (
    <PanelGroup direction="vertical">
      <Panel>
        <h3>About</h3>
        <p>
          The webpage <code>cw-iam</code> is a tool to find and compare IAM resources of public clouds.
          <br />
          At the moment Google Cloud Platform (GCP) and Amazon Web Service (AWS) is supported.
        </p>
        <p>
          We have no data about IAM resources. The source data is obtained from{" "}
          <a href="https://github.com/iann0036/iam-dataset" target="_blank" rel="noreferrer">
            iann0036/iam-dataset
          </a>{" "}
          (❤️ Thanks to @iann0036 and contributors).
          <br />
          This repository seems to be continuously updated, but we do not guarantee anything about the completeness and
          correctness of the data.
          <br />
          Please consult the official documents or resources before making any changes to your cloud project.
          <ul>
            <li>
              <a href="https://cloud.google.com/iam/docs/overview" target="_blank" rel="noreferrer">
                IAM overview | IAM Documentation | Google Cloud
              </a>
            </li>
            <li>
              <a
                href="https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html"
                target="_blank"
                rel="noreferrer"
              >
                What is IAM? - AWS Identity and Access Management
              </a>
            </li>
          </ul>
        </p>
        <h3>Features</h3>
        <ul>
          <li>
            <Link to="../roles">GCP / Predefined Roles</Link> You can browse{" "}
            <a href="https://cloud.google.com/iam/docs/understanding-roles" target="_blank" rel="noreferrer">
              the predefined IAM roles in Google Cloud
            </a>{" "}
            and compare the permissions included in the roles.
          </li>
          <li>
            <Link to="../permissions">GCP / IAM Permissions</Link> You can browse{" "}
            <a href="https://cloud.google.com/iam/docs/permissions-reference" target="_blank" rel="noreferrer">
              the IAM permissions in Google Cloud
            </a>
            .
          </li>
          <li>
            <Link to="../policies">AWS / Managed Policies</Link> Similarly, you can browse{" "}
            <a
              href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html#aws-managed-policies"
              target="_blank"
              rel="noreferrer"
            >
              the IAM managed policies in Amazon Web Service
            </a>{" "}
            and compare the allowed actions in the policy.
          </li>
          <li>
            <Link to="../actions">AWS / IAM Actions</Link> You can browse{" "}
            <a
              href="https://docs.aws.amazon.com/service-authorization/latest/reference/reference_policies_actions-resources-contextkeys.html"
              target="_blank"
              rel="noreferrer"
            >
              the IAM actions in Amazon Web Service.
            </a>
          </li>
          <li>
            TIPS: The fist icon <FaMemory className="icon" /> in the header is a permalink (that preserves filter text
            and selection state).
          </li>
        </ul>
        <h3>Contributions</h3>
        <p>
          The implementation of the tool is available as open-source, see{" "}
          <a href="https://github.com/fuzmish/cw-iam" target="_blank" rel="noreferrer">
            the source repository
          </a>
          .
          <br />
          Your contributions, including issues and pull requests, are welcome.
        </p>
      </Panel>
    </PanelGroup>
  )
}
