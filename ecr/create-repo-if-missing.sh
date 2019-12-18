#!/bin/sh

if [ "$#" -ne 3 ]; then
  echo "Usage is ./create-repo-if-missing.sh <image name> <path to access policy.json> <path to lifecyle policy.json>";
  exit 1;
fi

repo=$1
access=$2
lifecycle=$3

if ! [ -f "$access" ]; then
  echo "Policy file $access does not exist";
  exit 2;
fi

if ! [ -f "$lifecycle" ]; then
  echo "Policy file $lifecycle does not exist";
  exit 2;
fi

if aws ecr describe-repositories --repository-names $repo --query "repositories[].repositoryName" --output text ; then
  echo "Repository already exists"
else
  echo "Repo does not exist; creating"
  aws ecr create-repository --repository-name $repo

  echo "Applying repository access policy from $access"
  aws ecr set-repository-policy --repository-name $repo --policy-text "file://$access"

  echo "Applying repository lifecycle policy from $lifecycle"
  aws ecr put-lifecycle-policy --repository-name $repo --lifecycle-policy-text "file://$lifecycle"
fi
