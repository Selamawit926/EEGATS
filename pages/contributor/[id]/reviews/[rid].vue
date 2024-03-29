<script setup lang="ts">
import Modal from '@/components/Modal.vue';
import { Console } from 'console';

definePageMeta({ middleware: 'is-contributor' })
const route = useRoute();
const { $client } = useNuxtApp()
const contrId = route.params.id as string;
const reviewId = route.params.rid as string;
const { data, refresh: fetchReview } = await useAsyncData(() => $client.review.getQuestionForReview.query({ reviewId }));
const isLoading = ref(false);
const question = data.value?.questions;
const showErrorModal = ref(false);
const showSuccessModal = ref(false);
const errorText = ref("");

const reviewMetrics = ref([
    { "id": 1, "text": "Is this the first time you're seeing this question? ", "select": "" },
    { "id": 2, "text": "Is the chosen answer correct? ", "select": "" },
    { "id": 3, "text": "Does the question encourage critical thinking or problem-solving skills? ", "select": "" },
    { "id": 4, "text": "Is the question coherent or clear enough? ", "select": "" },
    { "id": 5, "text": "Are the choices clear enough? ", "select": "" },
    { "id": 6, "text": "Is the question's difficulty suitable? ", "select": "" },
    { "id": 7, "text": "Is the question engaging and interesting for the test taker? ", "select": "" },
    { "id": 8, "text": "Is the question in the category intended? ", "select": "" },
    { "id": 9, "text": "Is the question from the intended subject? ", "select": "" },
]);


const toggleErrorModal = () => {
    showErrorModal.value = !showErrorModal.value;
}

const toggleSuccessModal = () => {
    showSuccessModal.value = !showSuccessModal.value;
    navigateTo(`/contributor/${contrId}/reviews`);
}

const submitFeedback = async () => {
    isLoading.value = true;

    const isApproved = ref(true);
    reviewMetrics.value.forEach(metric => {

        if (metric.select === "") {
            errorText.value = "Please choose an option for all the metrics!";
            showErrorModal.value = true;
            isLoading.value = false;
            process.exit();
        }


        if (metric.id != 3 && metric.id != 7) {
            if (Boolean(metric.select) == false) {
                isApproved.value = false;
            }
        }
    });

    try {
        const res = await $client.review.registerFeedback.mutate({ feedback: "", reviewId: reviewId, final: isApproved.value });
        if (res) {
            isLoading.value = false;
            showSuccessModal.value = true;
        } else {
        }

    } catch (e: any) {
        isLoading.value = false;
        errorText.value = e.message;
        showErrorModal.value = true;
    }

}
</script>



<template>
    <div>
        <TopBar role="contributor" :id="contrId" />
        <div class="flex" :class="{'fixed w-full' : showErrorModal || showSuccessModal}">

            <ContributorSideBar pageName="reviews" :contrId="contrId" />
            <div class="w-full mx-6 content middle mt-20 ">
                <div class="flex flex-row  align-middle mt-10">
                    <NuxtLink :to="`/contributor/${contrId}/reviews`">
                        <Icon name="mdi:chevron-left" class="h-6 w-6 mr-2 "></Icon>
                    </NuxtLink>
                    <h2 class="intro-y text-lg font-medium ">Question</h2>
                </div>

                <div v-if="question">



                    <div class="mt-10">
                        <h4 class="intro-y text-md font-medium ">Subject: {{ question.pool.name }}</h4>
                        <h4 class="intro-y text-md font-medium ">Question Category: {{ question.category.name }}</h4>
                        <div v-html="question.title" class="p-2 mt-5"></div>
                        <img v-if="question.image" :src=question.image style="width: 10em; height: 10em;" />
                    </div>

                    <div v-for="choice in question.choices" :key="choice.id" class="ml-5">

                        <div class="flex flex-row align-middle my-1">
                            <input id="radio_1" type="radio" name="radio" :value="choice.id"
                                v-model="question.QuestionAnswer!.choiceId" :disabled="true">
                            <label class="pl-2 " for="radio_1">


                                <div v-html="choice.title" class="px-2"></div>
                                <img v-if="choice.image" :src=choice.image style="width: 10em; height: 10em;" />

                            </label>
                        </div>
                    </div>
                </div>

                <div class="mt-10">
                    <h2 class="intro-y text-lg font-medium mt-10 ">Review:-</h2>
                    <ol class="ml-5">
                        <li v-for="metric in reviewMetrics">
                            <form>
                                <div class="flex flex-row py-2">
                                    <p class="py-1 pr-4">{{ metric.text }}</p>
                                    <div class=" px-2">

                                        <input id={{metric.id}} type="radio" name="radio" :value="true"
                                            v-model="metric.select">
                                        <label class="pl-2 " for={{metric.id}}>
                                            Yes
                                        </label>
                                    </div>
                                    <div class=" px-2">

                                        <input id={{metric.id}} type="radio" name="radio" :value="false"
                                            v-model="metric.select">
                                        <label class="pl-2 " for={{metric.id}}>
                                            No
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </li>
                    </ol>
                    <div class="w-5/12 flex flex-row">
                        <button :disabled="isLoading" @click="submitFeedback()"
                            class="btn btn-primary shadow-md my-6 ml-auto">
                            <div v-if="isLoading">
                                <Icon name="eos-icons:bubble-loading" class="w-6 h-6"></Icon>
                            </div>
                            <div v-else>
                                Submit
                            </div>
                        </button>
                    </div>

                </div>
                
            </div>
        </div>
    </div>
    <Modal type="success" :show="showSuccessModal" :toggle="toggleSuccessModal" message="Success!" />
    <Modal type="error" :show="showErrorModal" :toggle="toggleErrorModal" :message="errorText" />
</template>

<style scoped>
.middle {
    margin-left: 13vmax;
}
.w-full.overflow-y-auto {
  height: calc(100vh - 4rem - 3.5rem); /* Adjust the height according to your needs */
}
</style>