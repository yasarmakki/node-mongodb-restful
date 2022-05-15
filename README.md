# node-mongodb-restful
This is CRUD nodejs app with mongodb


Creating a web server
You first need to create a container image. We will use Docker for that. We are creating a simple web server to see how Kubernetes works.

create a file app.js and copy this code into it
const http = require('http');
const os = require('os');
console.log("Kubia server starting...");
var handler = function (request, response) {
  console.log("Received request from " + request.connection.remoteAddress);
  response.writeHead(200);
  response.end("You've hit " + os.hostname() + "\n");
};
var www = http.createServer(handler);
www.listen(8080);
Now we will create a Docker file that will run on a cluster when we create a Docker image.

Create a file named Dockerfile and copy this code into it.
FROM node:8 

RUN npm i

ADD app.js /app.js

ENTRYPOINT [ "node", "app.js" ]
Building Docker Image
Make sure your Docker server is up and running. Now we will create a Docker image in our local machine. Open your terminal in the current project's folder and run

docker build -t kubia .

You’re telling Docker to build an image called kubia based on the contents of the current directory (note the dot . at the end of the build command). Docker will look for the Dockerfile in the directory and build the image based on the instructions in the file.

Now check your docker image created by running:

docker images

Getting docker images
docker images

This command lists all the images.

Running the container image
docker run --name kubia-container -p 8080:8080 -d kubia

This tells Docker to run a new container called kubia-container from the kubia image. The container will be detached from the console (-d flag), which means it will run in the background. Port 8080 on the local machine will be mapped to Port 8080 inside the container (-p 8080:8080 option), so you can access the app through localhost.

Accessing your application
Run in your terminal:

curl localhost:8080

You’ve hit 44d76963e8e1

Listing all your running containers
You can list all your running containers with this command.

docker ps

The docker ps command only shows the most basic information about the containers.

To get additional information about a container, run this command.

docker inspect kubia-container

You can see all the containers by running:

docker ps -a

Running a shell inside an existing container
The Node.js image on which you’ve based your image contains the bash shell, so you can run the shell inside the container like this:

docker exec -it kubia-container bash

This will run bash inside the existing kubia-container container. The bash process will have the same Linux namespaces as the main container process. This allows you to explore the container from within and see how Node.js and your app see the system when running inside the container.

The -it option is shorthand for two options:

-i, which makes sure STDIN is kept open. You need this for entering commands into the shell.
-t, which allocates a pseudo terminal (TTY).
Exploring container from within
Let’s see how to use the shell in the following listing to see the processes running in the container.

root@c61b9b509f9a:/# ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.4  1.3 872872 27832 ?        Ssl  06:01   0:00 node app.js
root        11  0.1  0.1  20244  3016 pts/0    Ss   06:02   0:00 bash
root        16  0.0  0.0  17504  2036 pts/0    R+   06:02   0:00 ps aux
You see only three processes. You don’t see any other processes from the host OS.

Like having an isolated process tree, each container also has an isolated filesystem. Listing the contents of the root directory inside the container will only show the files in the container and will include all the files that are in the image plus any files that are created while the container is running (log files and similar), as shown in the following listing.

root@c61b9b509f9a:/# ls
app.js  bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  package-lock.json  proc  root  run  sbin  srv  sys  tmp  usr  var
It contains the app.js file and other system directories that are part of the node:8 base image you’re using.

To exit the container, you exit the shell by running the exit command and you’ll be returned to your host machine (like logging out of an ssh session, for example).

Stopping and removing a container
docker stop kubia-container

This will stop the main process running in the container and consequently stop the container because no other processes are running inside the container. The container itself still exists and you can see it with docker ps -a. The -a option prints out all the containers, those running and those that have been stopped. To truly remove a container, you need to remove it with the docker rm command:

docker rm kubia-container

This deletes the container. All its contents are removed and it can’t be started again.

Pushing the image to an image registry
The image you’ve built has so far only been available on your local machine. To allow you to run it on any other machine, you need to push the image to an external image registry. For the sake of simplicity, you won’t set up a private image registry and will instead push the image to Docker Hub.

Before you do that, you need to re-tag your image according to Docker Hub’s rules. Docker Hub will allow you to push an image if the image’s repository name starts with your Docker Hub ID.

You create your Docker Hub ID by registering at hub-docker. I’ll use my own ID (knrt10) in the following examples. Please change every occurrence with your own ID.

Once you know your ID, you’re ready to rename your image, currently tagged as kubia, to knrt10/kubia (replace knrt10 with your own Docker Hub ID):

docker tag kubia knrt10/kubia

This doesn’t rename the tag; it creates an additional tag for the same image. You can confirm this by listing the images stored on your system with the Docker images command, as shown in the following listing.

docker images | head

As you can see, both kubia and knrt10/kubia point to the same image ID, so they’re in fact one single image with two tags.

Pushing image to docker hub
Before you can push the image to Docker Hub, you need to log in under your user ID with the docker login command. Once you’re logged in, you can finally push the yourid/kubia image to Docker Hub like this:

docker push knrt10/kubia

What is Kubernetes
Years ago, most software applications were big monoliths, running either as a single process or as a small number of processes spread across a handful of servers.

Today, these big monolithic legacy applications are slowly being broken down into smaller, independently running components called microservices.

Because microservices are decoupled from each other, they can be developed, deployed, updated, and scaled individually. This enables you to change components quickly and as often as necessary to keep up with today’s rapidly changing business requirements.

But with bigger numbers of deployable components and increasingly larger datacenters, it becomes increasingly difficult to configure, manage, and keep the whole system running smoothly.

It’s much harder to figure out where to put each of those components to achieve high resource utilization and thereby keep the hardware costs down. Doing all this manually is hard work.

We need:

automation (including automatic scheduling of those components to our servers);
automatic configuration;
supervision; and
failure-handling.
This is where Kubernetes comes in.

Kubernetes enables developers to deploy their applications themselves and as often as they want, without requiring any assistance from the operations (ops) team.

But Kubernetes doesn’t solely benefit developers. It also helps the ops team by automatically monitoring and rescheduling those apps in the event of a hardware failure.

The focus for system administrators (sysadmins) shifts from supervising individual apps to mostly supervising and managing Kubernetes and the rest of the infrastructure, while Kubernetes itself takes care of the apps.

Splitting apps into microservice
Each microservice runs as an independent process and communicates with other microservices through simple, well-defined interfaces (APIs). Refer to the image below:

Microservice

- Image taken from other source.

Microservices communicate through synchronous protocols such as HTTP, over which they usually expose RESTful (REpresentational State Transfer) APIs, or through asynchronous protocols such as AMQP (Advanced Message Queueing Protocol).

These protocols are simple, well understood by most developers, and not tied to any specific programming language. Each microservice can be written in the language that’s most appropriate for implementing that specific microservice.

Because each microservice is a standalone process with a relatively static external API, it’s possible to develop and deploy each microservice separately. A change to one of them doesn’t require changes or redeployment of any other service, provided that the API doesn’t change or changes only in a backward-compatible way.

Scaling Microservices
Scaling microservices, unlike monolithic systems, where you need to scale the system as a whole, is done on a per-service basis, which means you have the option of scaling only those services that require more resources, while leaving others at their original scale. Refer to the image below:

Scaling

- Image taken from other source.

When a monolithic application can’t be scaled out because one of its parts is unscalable, splitting the app into microservices allows you to horizontally scale the parts that allow scaling out. The parts that don't scale horizontally can be scaled vertically instead.

Deploying Microservices
As always, microservices also have drawbacks. When your system consists of only a small number of deployable components, managing those components is easy. It’s trivial to decide where to deploy each component, because there aren’t that many choices.

When the number of those components increases, deployment-related decisions become increasingly difficult because not only does the number of deployment combinations increase, but the number of inter-dependencies between the components increases by an even greater factor.

Microservices also bring other problems, such as making it hard to debug and trace execution calls, because they span multiple processes and machines. Luckily, these problems are now being addressed with distributed tracing systems such as Zipkin.

Drawback

Multiple applications running on the same host may have conflicting dependencies.

Working with Kubernetes
Now that you have your app packaged inside a container image and made available through Docker Hub, you can deploy it in a Kubernetes cluster instead of running it in Docker directly. But first, you need to set up the cluster itself.

Setting up a Kubernetes cluster
Setting up a full-fledged, multi-node Kubernetes cluster isn’t a simple task, especially if you’re not well-versed in Linux and networking administration.

A proper Kubernetes install spans multiple physical or virtual machines and requires the networking to be set up properly so that all the containers running inside the Kubernetes cluster can connect to each other through the same flat networking space.

Running a local single node Kubernetes cluster with Minikube
The simplest and quickest path to a fully functioning Kubernetes cluster is by using Minikube. Minikube is a tool that sets up a single-node cluster that’s great for both testing Kubernetes and developing apps locally.

Starting a Kubernetes cluster with minikube
Once you have Minikube installed locally, you can immediately start up the Kubernetes cluster with the following command:

minikube start

Starting local Kubernetes cluster...
Starting VM...
SSH-ing files into VM...
...
Kubectl is now configured to use the cluster.
Starting the cluster takes more than a minute, so don’t interrupt the command before it completes.

Checking to see if the cluster is up and Kubernetes can talk to it
To interact with Kubernetes, you also need the kubectl CLI client. Installing it is easy.

To verify your cluster is working, you can use the kubectl cluster-info command shown in the following listing.

kubectl cluster-info

Kubernetes master is running at https://192.168.99.100:8443

kubernetes-dashboard is running at https://192.168.99.100:8443/api/v1/...

KubeDNS is running at https://192.168.99.100:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
This shows the cluster is up. It shows the URLs of the various Kubernetes components, including the API server and the web console.

Deploying your Node app
A simple way to deploy your app is to use the kubectl create command, which will create all the necessary components without having to deal with JSON or YAML.

kubectl create deployment kubia --image=knrt10/kubia --port=8080

The --image=knrt10/kubia part obviously specifies the container image you want to run, and the --port=8080 option tells Kubernetes that your app is listening on port 8080.

Listing Pods
Because you can’t list individual containers since they’re not standalone Kubernetes objects, can you list pods instead? Yes, you can. Let’s see how to tell kubectl to list pods in the following listing.

kubectl get pods

$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
kubia-57c4d74858-tflb8   1/1     Running   0          24s
Accessing your web application
With your pod running, how do you access it? Each pod gets its own IP address, but this address is internal to the cluster and isn’t accessible from outside of it. To make the pod accessible from the outside, you’ll expose it through a Service object.

You’ll create a special service of type LoadBalancer because if you create a regular service (a ClusterIP service), as the pod, it would also only be accessible from inside the cluster. By creating a LoadBalancer-type service, an external load balancer will be created and you can connect to the pod through the load balancer’s public IP.

Creating a service object
To create the service, you’ll tell Kubernetes to expose the Deployment you created earlier:

kubectl expose deploy kubia --type=LoadBalancer --name kubia-http

service/kubia-http exposed

Important: We’re using the abbreviation deploy instead of deployments. Most resource types have an abbreviation like this so you don’t have to type the full name (for example, po for pods, svc for services, and so on).

Listing Services
The expose command’s output mentions a service called kubia-http. Services are objects like Pods and Nodes, so you can see the newly created Service object by running the kubectl get services | svc command, as shown in the following listing.

kubectl get svc

NAME         TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
kubernetes   ClusterIP      10.96.0.1      <none>        443/TCP          30h
kubia-http   LoadBalancer   10.107.88.67   <pending>     8080:32718/TCP   81s
Important :- Minikube doesn’t support LoadBalancer services, so the service will never get an external IP. But you can access the service anyway through its external port. So external IP will always be pending in that case. When using Minikube, you can get the IP and port through which you can access the service by running

minikube service kubia-http

Horizontally scaling the application
You now have a running application, monitored and kept running by a Deployment and exposed to the world through a service. Now let’s make additional magic happen. One of the main benefits of using Kubernetes is the simplicity with which you can scale your deployments. Let’s see how easy it is to scale up the number of pods. You’ll increase the number of running instances to three.

Your pod is managed by a Deployment. Let’s see it with the kubectl get command:

kubectl get deploy

NAME    READY   UP-TO-DATE   AVAILABLE   AGE
kubia   1/1     1            1           4m58s
Increasing the desired Replica count
To scale up the number of replicas of your pod, you need to change the desired replica count in the Deployment like this:

kubectl scale deploy kubia --replicas=3

deployment.apps/kubia scaled

You’ve now told Kubernetes to make sure three instances of your pod are always running. Notice that you didn’t instruct Kubernetes what action to take. You didn’t tell it to add two more pods. You only set the new desired number of instances and let Kubernetes determine what actions it needs to take to achieve the requested state.

Seeing the result of the Scale Out
Back to your replica count increase. Let’s list the Deployments again to see the updated replica count:

kubectl get deploy

NAME    READY   UP-TO-DATE   AVAILABLE   AGE
kubia   3/3     3            3           6m43s
Because the actual number of pods has already been increased to three (as evident from the CURRENT column), listing all the pods should now show three pods instead of one:

kubectl get pods

NAME                     READY   STATUS    RESTARTS   AGE
kubia-57c4d74858-d284g   1/1     Running   0          94s
kubia-57c4d74858-tflb8   1/1     Running   0          7m9s
kubia-57c4d74858-wfgmb   1/1     Running   0          94s
As you can see, three pods exist instead of one. Currently running, but if it is pending, it would be ready in a few moments, as soon as the container image is downloaded and the container is started.

As you can see, scaling an application is incredibly simple. Once your app is running in production and a need to scale the app arises, you can add additional instances with a single command without having to install and run additional copies manually.

Keep in mind that the app itself needs to support being scaled horizontally. Kubernetes doesn’t magically make your app scalable; it only makes it trivial to scale the app up or down.

Displaying the Pod IP and Pods Node when listing Pods
If you’ve been paying close attention, you probably noticed that the kubectl get pods command doesn’t even show any information about the nodes the pods are scheduled to. This is because it’s usually not an important piece of information.

But you can request additional columns to display using the -o wide option. When listing pods, this option shows the pod’s IP and the node the pod is running on:

kubectl get pods -o wide

$ kubectl get pods -o wide
NAME                     READY   STATUS    RESTARTS   AGE     IP           NODE       NOMINATED NODE   READINESS GATES
kubia-57c4d74858-d284g   1/1     Running   0          2m53s   172.17.0.5   minikube   <none>           <none>
kubia-57c4d74858-tflb8   1/1     Running   0          8m28s   172.17.0.3   minikube   <none>           <none>
kubia-57c4d74858-wfgmb   1/1     Running   0          2m53s   172.17.0.4   minikube   <none>           <none>
Accessing Dashboard when using Minikube
To open the dashboard in your browser when using Minikube to run your Kubernetes cluster, run the following command:

minikube dashboard

Pods
Pods and other Kubernetes resources are usually created by posting a JSON or YAML manifest to the Kubernetes REST API endpoint. Also, you can use other, simpler ways of creating resources, such as the kubectl run command, but they usually only allow you to configure a limited set of properties, not all. Additionally, defining all your Kubernetes objects from YAML files makes it possible to store them in a version control system, with all the benefits it brings.

Examining a YAML descriptor of an existing pod
You’ll use the kubectl get command with the -o yaml option to get the whole YAML definition of the pod, or you can use -o json to get the whole JSON definition as shown in the following listing.

kubectl get po kubia-bsksp -o yaml

Introducing the main parts of a POD definition
The pod definition consists of a few parts. First, there’s the Kubernetes API version used in the YAML and the type of resource the YAML is describing. Then, three important sections are found in almost all Kubernetes resources:

Metadata includes the name, namespace, labels, and other information about the pod.
Spec contains the actual description of the pod’s contents, such as the pod’s containers, volumes, and other data.
Status contains the current information about the running pod, such as what condition the pod is in, the description and status of each container, and the pod’s internal IP and other basic info.
The status part contains read-only runtime data that shows the state of the resource at a given moment. When creating a new pod, you never need to provide the status part.

The three parts described previously show the typical structure of a Kubernetes API object. All other objects have the same anatomy. This makes understanding new objects relatively easy.

Going through all the individual properties in the previous YAML doesn’t make much sense, so, instead, let’s see what the most basic YAML for creating a pod looks like.

Creating a simple YAML descriptor for a pod
You’re going to create a file called kubia-manual.yaml (you can create it in any directory you want), or copy from this repo, where you’ll find the file with filename kubia-manual.yaml. The following listing shows the entire contents of the file.

apiVersion: v1
kind: Pod
metadata:
  name: kubia-manual
spec:
  containers:
  - image: knrt10/kubia
    name: kubia
    ports:
    - containerPort: 8080
      protocol: TCP
Let’s examine this descriptor in detail. It conforms to the v1 version of the Kubernetes API. The type of resource you’re describing is a pod, with the name kubia-manual. The pod consists of a single container based on the knrt10/kubia image. You’ve also given a name to the container and indicated that it’s listening on port 8080.

Using kubectl create to create the pod
To create the pod from your YAML file, use the kubectl create command:

kubectl create -f kubia-manual.yaml

pod/kubia-manual created

The kubectl create -f command is used for creating any resource (not only pods) from a YAML or JSON file.

Retrieving a PODs logs with Kubectl logs
Your little Node.js application logs to the process’s standard output. Containerized applications usually log to the standard output and standard error stream instead of writing their logs to files. This is to allow users to view logs of different applications in a simple, standard way.

To see your pod’s log (more precisely, the container’s log) you run the following command on your local machine (no need to ssh anywhere):

kubectl logs kubia-manual

Kubia server starting...

You haven’t sent any web requests to your Node.js app, so the log only shows a single log statement about the server starting up. As you can see, retrieving logs of an application running in Kubernetes is incredibly simple if the pod only contains a single container.

Specifying the container name when getting logs of multiple container pod
If your pod includes multiple containers, you have to explicitly specify the container name by including the -c container name option when running kubectl logs. In your kubia-manual pod, you set the container’s name to kubia, so if additional containers exist in the pod, you’d have to get its logs like this:

kubectl logs kubia-manual -c kubia

Note that you can only retrieve container logs of pods that are still in existence. When a pod is deleted, its logs are also deleted.

Forwarding a Local Network to a port in the Pod
When you want to talk to a specific pod without going through a service (for debugging or other reasons), Kubernetes allows you to configure port forwarding to the pod. This is done through the kubectl port-forward command. The following command will forward your machine’s local port 8888 to port 8080 of your kubia-manual pod:

kubectl port-forward kubia-manual 8888:8080

In a different terminal, you can now use curl to send an HTTP request to your pod through the kubectl port-forward proxy running on localhost:8888:

curl localhost:8888

You've hit kubia-manual

Using port forwarding like this is an effective way to test an individual pod.

Introducing labels
Organizing pods and all other Kubernetes objects is done through labels. Labels are a simple, yet incredibly powerful, Kubernetes feature for organizing not only pods, but all other Kubernetes resources. A label is an arbitrary key-value pair you attach to a resource, which is then utilized when selecting resources using label selectors (resources are filtered based on whether they include the label specified in the selector).

Specifying labels when creating a pod
Now, you’ll see labels in action by creating a new pod with two labels. Create a new file called kubia-manual-with-labels.yaml with the contents of the following listing. You can also copy from kubia-manual-with-labels.yaml

apiVersion: v1
kind: Pod
metadata:
  name: kubia-manual-v2
  labels:
    creation_method: manual
    env: prod
spec:
  containers:
  - image: knrt10/kubia
    name: kubia
    ports:
    - containerPort: 8080
      protocol: TCP
You’ve included the labels creation_method=manual and env=data.labels section. You’ll create this pod now:

kubectl create -f kubia-manual-with-labels.yaml

pod/kubia-manual-v2 created

The kubectl get po command doesn’t list any labels by default, but you can see them by using the --show-labels switch:

kubectl get po --show-labels

NAME              READY     STATUS    RESTARTS   AGE       LABELS
kubia-5k788       1/1       Running   1          8d        run=kubia
kubia-7zxwj       1/1       Running   1          5d        run=kubia
kubia-bsksp       1/1       Running   1          5d        run=kubia
kubia-manual      1/1       Running   0          7h        <none>
kubia-manual-v2   1/1       Running   0          3m        creation_method=manual,env=prod
Instead of listing all labels, if you’re only interested in certain labels, you can specify them with the -L switch and have each displayed in its own column. List pods again and show the columns for the two labels you’ve attached to your kubia-manual-v2 pod:

kubectl get po -L creation_method,env

Modifying labels of existing pods
Labels can also be added to and modified on existing pods. Because the kubia-manual pod was also created manually, let’s add the creation_method=manual label to it:

kubectl label po kubia-manual creation_method=manual

Now, let’s also change the env=prod label to env=debug on the kubia-manual-v2 pod, to see how existing labels can be changed. You need to use the --overwrite option when changing existing labels.

kubectl label po kubia-manual-v2 env=debug --overwrite

Listing subsets of pods through label selectors
Attaching labels to resources so you can see the labels next to each resource when listing them isn’t that interesting. But labels go hand in hand with label selectors. Label selectors allow you to select a subset of pods tagged with certain labels and perform an operation on those pods.

A label selector can select resources based on whether the resource

Contains (or doesn’t contain) a label with a certain key
Contains a label with a certain key and value
Contains a label with a certain key, but with a value not equal to the one you specify
Listing pods using a label selector
Let’s use label selectors on the pods you’ve created so far. To see all pods you created manually (you labeled them with creation_method=manual), do the following:

kubectl get po -l creation_method=manual

NAME              READY     STATUS    RESTARTS   AGE
kubia-manual      1/1       Running   0          22h
kubia-manual-v2   1/1       Running   0          14h
And those that don’t have the env label:

kubectl get po -l '!env'

NAME           READY     STATUS    RESTARTS   AGE
kubia-5k788    1/1       Running   1          9d
kubia-7zxwj    1/1       Running   1          5d
kubia-bsksp    1/1       Running   1          5d
kubia-manual   1/1       Running   0          22h
Make sure to use single quotes around !env, so the bash shell doesn’t evaluate the exclamation mark

Using multiple conditions in a label selector
A selector can also include multiple comma-separated criteria. Resources need to match all of them to match the selector. You can execute command given below

kubectl get po -l '!env , !creation_method' --show-labels

Using labels and selectors to constrain pod scheduling
All the pods you’ve created so far have been scheduled pretty much randomly across your worker nodes. Certain cases exist, however, where you’ll want to have at least a little say in where a pod should be scheduled. A good example is when your hardware infrastructure isn’t homogenous. You never want to say specifically what node a pod should be scheduled to, because that would couple the application to the infrastructure, whereas the whole idea of Kubernetes is hiding the actual infrastructure from the apps that run on it.

Using labels for categorizing worker nodes
The pods aren't only kubernetes resource type that you can attach label to. Labels can be attached to any Kubernetes resource including nodes.

Let’s imagine one of the nodes in your cluster contains a GPU meant to be used for general-purpose GPU computing. You want to add a label to the node showing this feature. You’re going to add the label gpu=true to one of your nodes (pick one out of the list returned by kubectl get nodes):

kubectl label node minikube gpu=true

node/minikube labeled

Now you can use a label selector when listing the nodes, like you did before with pods. List only nodes that include the label gpu=true:

kubectl get node -l gpu=true

NAME       STATUS    ROLES     AGE       VERSION
minikube   Ready     master    9d        v1.10.0
As expected, only one node has this label. You can also try listing all the nodes and tell kubectl to display an additional column showing the values of each node’s gpu label.

kubectl get nodes -L gpu

NAME       STATUS    ROLES     AGE       VERSION   GPU
minikube   Ready     master    9d        v1.10.0   true
Scheduling pods to specific nodes
Now imagine you want to deploy a new pod that needs a GPU to perform its work. To ask the scheduler to only choose among the nodes that provide a GPU, you’ll add a node selector to the pod’s YAML. Create a file called kubia-gpu.yaml with the following listing’s contents and then use kubectl create -f kubia-gpu.yaml to create the pod. The contents of file are

apiVersion: v1
kind: Pod
metadata:
  name: kubia-gpu
spec:
  nodeSelector:
    gpu: "true"
  containers:
  - image: luksa/kubia
    name: kubia
You’ve added a nodeSelector field under the spec section. When you create the pod, the scheduler will only choose among the nodes that contain the gpu=true label (which is only a single node in your case).

Scheduling to one specific node
Similarly, you could also schedule a pod to an exact node, because each node also has a unique label with the key kubernetes.io/hostname and value set to the actual hostname of the node. Example shown below

kubectl get nodes --show-labels

NAME       STATUS    ROLES     AGE       VERSION   LABELS
minikube   Ready     master    9d        v1.10.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,gpu=true,kubernetes.io/hostname=minikube,node-role.kubernetes.io/master=
But setting the nodeSelector to a specific node by the hostname label may lead to the pod being unschedulable if the node is offline.

Annotating pods
In addition to other labels, pods and other objects can also contain annotations. They are also key value pairs, so in essence they are similar to labels, but aren't meant to hold identifying information. They can't be used to group objects the way label can. While objects can be selected through label selectors, there’s no such thing as an annotation selector. On the other hand, annotations can hold much larger pieces of information and are primarily meant to be used by tools. Certain annotations are automatically added to objects by Kubernetes, but others are added by users manually.

A great use to annotating pods is to add desciption to each pod or other API object so that everyone using the cluster can quickly look up information about each individual object.

Looking up an objects annotations
Let’s see an example of an annotation that Kubernetes added automatically to the pod you created in the previous section. To see the annotations, you’ll need to request the full YAML of the pod or use the kubectl describe command. You’ll use the first option in the following listing.

kubectl get po kubia-zb95q -o yaml

apiVersion: v1
kind: Pod
metadata:
  annotations:
    kubernetes.io/created-by: |
      {"kind":"SerializedReference", "apiVersion":"v1",
      "reference":{"kind":"ReplicationController", "namespace":"default", ...
Without going into too many details, as you can see, the kubernetes.io/created-by annotation holds JSON data about the object that created the pod. That’s not something you’d want to put into a label. Labels should be short, whereas annotations can contain relatively large blobs of data (up to 256 KB in total).

Important:- The kubernetes.io/created-by annotations was deprecated in version 1.8 and will be removed in 1.9, so you will no longer see it in the YAML.

Adding and modifying annotations
Annotations can obviously be added to pods at creation time, the same way label can. But we can also add it after using the following command. Let's try adding this to kubia-manual pod now.

kubectl annotate pod kubia-manual knrt10.github.io/someannotation="messi ronaldo"

You added the annotation knrt10.github.io/someannotation with the value messi ronaldo. It’s a good idea to use this format for annotation keys to prevent key collisions. When different tools or libraries add annotations to objects, they may accidentally override each other’s annotations if they don’t use unique prefixes like you did here. You can check your pod now using following command

kubectl describe po kubia-manual

Using namespace to group resources
Previously we saw how labels organize pods and objects into groups. Because each object can have multiple labels, those groups of objects can overlap. Plus, when working with the cluster (through kubectl for example), if you don’t explicitly specify a label selector, you’ll always see all objects.

Discovering other namespaces and their pods
Let us first list all the namespaces in our cluster, type the following command

kubectl get ns

NAME          STATUS    AGE
default       Active    9h
kube-public   Active    9h
kube-system   Active    9h
Up to this point, you’ve operated only in the default namespace. When listing resources with the kubectl get command, you’ve never specified the namespace explicitly, so kubectl always defaulted to the default namespace, showing you only the objects in that namespace. But as you can see from the list, the kube-public and the kube-system namespaces also exist. Let’s look at the pods that belong to the kube-system namespace, by telling kubectl to list pods in that namespace only:

kubectl get po -n kube-system

NAME                                    READY     STATUS    RESTARTS   AGE
etcd-minikube                           1/1       Running   0          4h
kube-addon-manager-minikube             1/1       Running   1          9h
kube-apiserver-minikube                 1/1       Running   0          4h
kube-controller-manager-minikube        1/1       Running   0          4h
kube-dns-86f4d74b45-w8mqv               3/3       Running   4          9h
kube-proxy-25t92                        1/1       Running   0          4h
kube-scheduler-minikube                 1/1       Running   0          4h
kubernetes-dashboard-5498ccf677-2zcw5   1/1       Running   2          9h
storage-provisioner                     1/1       Running   2          9h
I will explain about these pods later (don’t worry if the pods shown here don’t match the ones on your system exactly). It’s clear from the name of the namespace that these are resources related to the Kubernetes system itself. By having them in this separate namespace, it keeps everything nicely organized. If they were all in the default namespace, mixed in with the resources you create yourself, you’d have a hard time seeing what belongs where, and you might inadvertently delete system resources.

Namespaces enable you to separate resources that don’t belong together into nonoverlapping groups. If several users or groups of users are using the same Kubernetes cluster, and they each manage their own distinct set of resources, they should each use their own namespace. This way, they don’t need to take any special care not to inadvertently modify or delete the other users’ resources and don’t need to concern themselves with name conflicts, because namespaces provide a scope for resource names, as has already been mentioned.

Creating a namespace
A namespace is a Kubernetes resource like any other, so you can create it by posting a YAML file to the Kubernetes API server. Let’s see how to do this now.

You’re going to create a file called custom-namespace.yaml (you can create it in any directory you want), or copy from this repo, where you’ll find the file with filename custom-namespace.yaml. The following listing shows the entire contents of the file.

apiVersion: v1
kind: Namespace
metadata:
  name: custom-namespace
Now type the following command

kubectl create -f custom-namespace.yaml

namespace/custom-namespace created

Managing objects in other namespaces
To create resources in the namespace you’ve created, either add a namespace: customnamespace entry to the metadata section, or specify the namespace when creating the resource with the kubectl create command:

kubectl create -f kubia-manual.yaml -n custom-namespace

pod/kubia-manual created

You now have two pods with the same name (kubia-manual). One is in the default namespace, and the other is in your custom-namespace.

When listing, describing, modifying, or deleting objects in other namespaces, you need to pass the --namespace (or -n) flag to kubectl. If you don’t specify the namespace, kubectl performs the action in the default namespace configured in the current kubectl context. The current context’s namespace and the current 
