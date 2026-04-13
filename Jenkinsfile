pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE          = "${DOCKERHUB_CREDENTIALS_USR}/infnet-guia"
        NAMESPACE             = 'infnet-guia'
        K8S_DEPLOYMENT        = 'infnet-guia'
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "Branch: ${GIT_BRANCH} | Commit: ${GIT_COMMIT}"'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build \
                        --tag ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        --tag ${DOCKER_IMAGE}:latest \
                        --label "build=${BUILD_NUMBER}" \
                        --label "commit=${GIT_COMMIT}" \
                        .
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_CREDENTIALS_USR}" --password-stdin'
                sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh "docker push ${DOCKER_IMAGE}:latest"
            }
            post {
                always {
                    sh 'docker logout'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl apply -f k8s/namespace.yaml               --kubeconfig=${KUBECONFIG}
                        kubectl apply -f k8s/redis/                        --kubeconfig=${KUBECONFIG}
                        kubectl apply -f k8s/app/                          --kubeconfig=${KUBECONFIG}
                        kubectl apply -f k8s/monitoring/                   --kubeconfig=${KUBECONFIG}
                    """

                    sh """
                        kubectl set image deployment/${K8S_DEPLOYMENT} \
                            ${K8S_DEPLOYMENT}=${DOCKER_IMAGE}:${BUILD_NUMBER} \
                            -n ${NAMESPACE} \
                            --kubeconfig=${KUBECONFIG}
                    """

                    sh """
                        kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                            -n ${NAMESPACE} \
                            --timeout=120s \
                            --kubeconfig=${KUBECONFIG}
                    """
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    script {
                        def nodeIp = sh(
                            script: "kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type==\"InternalIP\")].address}' --kubeconfig=${KUBECONFIG}",
                            returnStdout: true
                        ).trim()

                        sh """
                            echo "Node IP: ${nodeIp}"
                            curl -sf http://${nodeIp}:30000/api/health | grep '"status":"ok"'
                            echo "✅ Smoke test passou!"
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline executado com sucesso! Imagem: ${DOCKER_IMAGE}:${BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline falhou. Verificar logs acima."
        }
        cleanup {
            sh "docker rmi ${DOCKER_IMAGE}:${BUILD_NUMBER} || true"
        }
    }
}
