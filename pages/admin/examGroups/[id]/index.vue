<template>
    <div>
        <AdminTopBar role="admin" />
        <div class="flex" :class="{'fixed w-full' : istestTakerCreated || showErrorModal || showPracticeModal || showAddModal}">

            <AdminSideBar pageName="" />
            <div v-if="examGroup" class="w-full mx-6 content middle mt-20">
                <div class="flex flex-row w-full align-middle justify-between  mt-10">
                    <div class="justify-start flex flex-row">

                        <NuxtLink :to="`/admin/examGroups`">
                            <Icon name="mdi:chevron-left" class="h-6 w-6 mr-2 "></Icon>
                        </NuxtLink>
                        <h2 class="intro-y text-lg font-medium ">{{ examGroup.name }}</h2>
                    </div>


                    <div class="flex flex-row justify-end">
                        <a class="btn btn-primary shadow-md mt-5 mr-4 text-white"
                            :href="`/admin/examGroups/${examGroupId}/analytics`">Analytics
                            <Icon name="tabler:device-analytics" class="w-6 h-6 ml-2 text-white"></Icon>
                        </a>

                    </div>
                </div>

                <div class="mx-5 mt-5">
                    <ul class="nav nav-link-tabs" role="tablist">
                        <li id="example-5-tab" class="nav-item flex-1" role="presentation">
                            <button class="nav-link w-full py-2 " @click="activeTab = 1"
                                :class="{ 'active text-xl': activeTab === 1 }" data-tw-toggle="pill" data-tw-target="#example-tab-5"
                                type="button" role="tab" aria-controls="example-tab-5" aria-selected="true">
                                Test Takers
                            </button>
                        </li>
                        <li id="example-6-tab" class="nav-item flex-1" role="presentation">
                            <button class="nav-link w-full py-2" @click="activeTab = 2"
                                :class="{ 'active text-xl': activeTab === 2 }" data-tw-toggle="pill" data-tw-target="#example-tab-6"
                                type="button" role="tab" aria-controls="example-tab-6" aria-selected="true">
                                Exams
                            </button>
                        </li>
                    </ul>
                    <div class="tab-content mt-5">
                        <div id="example-tab-5" class="tab-pane leading-relaxed " role="tabpanel"
                            aria-labelledby="example-5-tab" :class="{ 'active': activeTab === 1 }">
                            <div class="w-full mx-6">


                                <div class="grid grid-cols-12 gap-6 mt-5 ">
                                    <div class="intro-y col-span-12 flex flex-row sm:flex-nowrap items-center mt-2">

                                        <button v-on:click="toggleAddModal()"
                                            class="btn btn-primary shadow-md mr-2">Generate credentials
                                            <Icon name="material-symbols:add-box-rounded" class="w-6 h-6 ml-2 text-white">
                                            </Icon>
                                        </button>

                                        <div class="hidden md:block mx-auto text-slate-500">

                                        </div>
                                        <div class="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
                                            <div class="w-56 relative text-slate-500">
                                                <input type="text" class="form-control w-56 box pr-10" v-model="searchText" placeholder="Search..." />
                                                <Icon name="carbon:search" class="w-4 h-4 absolute my-auto inset-y-0 mr-3 right-0"></Icon>
                            
                                            </div>
                                        </div>

                                    </div>
                                   
                                    <div
                                        class="intro-y col-span-12 flex flex-row sm:flex-nowrap items-center justify-end mt-2">
                                         <div class="flex items-center sm:ml-auto mt-3 sm:mt-0">
                                        <button class="btn box flex items-center text-slate-600 dark:text-slate-300 shadow" @click="exportTableData()">  <Icon name="material-symbols:export-notes-outline" class="hidden sm:block w-4 h-4 mr-2 text-primary"></Icon> Export Credential </button>
                                        <button class="ml-3 btn box flex items-center text-slate-600 dark:text-slate-300 shadow" @click="exportData()"><Icon name="material-symbols:export-notes-outline" class="hidden sm:block w-4 h-4 mr-2 text-primary"></Icon> Export Grade </button>
                                    </div>
                                    </div>


                                    <div v-if="isReloading" class="flex justify-center items-center">
                                        <Icon name="eos-icons:bubble-loading" class="w-6 h-6 "></Icon>
                                    </div>
                                    <div v-else class="intro-y col-span-12 overflow-auto lg:overflow-visible">

                                        <table class="table table-report -mt-2">
                                            <thead>
                                                <tr>
                                                    <th class="whitespace-nowrap"></th>
                                                    <th class="whitespace-nowrap">Name</th>
                                                    <th class="text-center whitespace-nowrap">Admission number</th>
                                                    <th></th>
                                                    <th class="text-center whitespace-nowrap">ACTIONS</th>


                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="student in searchTestTakers" :key="student.id" class="intro-x">
                                                    <td class="w-10">
                                                        <NuxtLink :to="`/admin/exams/${student.id}`">
                                                            <Icon name="iconoir:page" class="w-6 h-6"></Icon>
                                                        </NuxtLink>
                                                    </td>
                                                    <td>
                                                        <NuxtLink :to="`/admin/exams/${student.id}`"
                                                            class="font-medium whitespace-nowrap">{{
                                                                student.name.length > 40 ? student.name.slice(0, 39) + "..." :
                                                                student.name
                                                            }}</NuxtLink>

                                                    </td>
                                                    <td class="text-center">{{ student.username }}</td>
                                                    <td class="w-16">
                                                        <div v-if="student.failedAttempts >= 3" class="mx-auto">
                                                            <div
                                                                class="bg-red-500 text-white px-2 py-1 rounded-xl text-center w-16">
                                                                <p>Locked</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td class="table-report__action w-96">
                                                        <div class="flex justify-center items-center">

                                                            <a class="flex items-center mr-6" href="javascript:;"
                                                                @click="ResetPasswordModal(student.id)">
                                                                <Icon name="material-symbols:key-rounded"
                                                                    class="w-4 h-4 mr-1"></Icon> Reset Password
                                                            </a>

                                                        </div>
                                                    </td>

                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                   </div>
                                  
                                    <!-- BEGIN: Pagination -->
                                    <div class="flex flex-row mt-3">
                      <div class="md:block  text-slate-500">
                   
                          </div>
                        <div class=" ml-auto intro-y col-span-12 flex flex-wrap sm:flex-row sm:flex-nowrap items-center">
                            <nav class="w-full sm:w-auto sm:mr-auto">
                                <ul class="pagination">
                                    
                                   
                                    <li class="page-item">
                                            <button class="page-link" v-on:click="paginateSearch(searchPage - 1)" :disabled="searchPage===1">
                                                <div class="flex flex-row align-middle justify-center items-center  ">
                                                    <Icon name="mdi:chevron-left" class="h-4 w-4 align-middle"></Icon>
                                                    <span class="">Previous</span>
                                                </div>
                                            </button>
                                        </li>
                                        <li class="page-item">  
                                            <button class="page-link" v-on:click="paginateSearch(searchPage+1)" :disabled="(searchPage) * 6 >= searchCount!">
                                                <div class="flex flex-row align-middle justify-center items-center">
                                                        <span>Next</span>
                                                        <Icon name="mdi:chevron-right" class="h-4 w-4 align-middle"></Icon>
                                                </div>
                                                </button>
                                         </li>
            
                
                                    </ul>
                            </nav>
                            
                            </div>
                     </div>
                                    <!-- END: Pagination -->
                                </div>
                    
                     
                        
                        </div>
                        <div id="example-tab-6" class="tab-pane leading-relaxed" role="tabpanel"
                            aria-labelledby="example-6-tab" :class="{ 'active': activeTab === 2 }">

                            <div v-if="examGroup">
                        <div class="flex flex-row justify-between">


                            <div class="flex flex-row justify-end">
                                <button v-if="publishBtn" class="btn btn-primary shadow-md mt-5 mr-4 text-white"
                                    @click="togglePracticeModal">Practice Exam   <Icon name="material-symbols:add-box-rounded" class="w-6 h-6 ml-2 text-white">
                                            </Icon></button>
                                <button v-if="isPractice" class="btn btn-primary shadow-md mt-5 mr-4 text-white"
                                   disabled>Practice Exams Published   <Icon name="material-symbols:check-circle-outline" class="w-6 h-6 ml-2 text-white">
                                            </Icon></button>
                            </div>



                        </div>
                    </div>


                            <ExamsList :examGroupId="examGroupId" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <!-- csv file add modal -->
    </div>
    <div v-if="showAddModal" class="fixed z-[100] inset-0 px-[1em] bg-[#00000076] py-36 h-[100%]">
    <div v-if="showAddModal"
        class="overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none justify-center items-center flex">
        <div class="relative w-2/6 my-6 mx-auto max-w-10xl">
            <!--content-->
            <div
                class="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <!--header-->
                <div class="flex items-start justify-between p-5 border-solid border-slate-200 rounded-t">

                    <button
                        class="ml-auto text-gray-500 hover:text-black bg-transparent font-bold uppercase text-sm py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button" v-on:click="toggleAddModal()">
                        <Icon name="iconoir:cancel" class="w-6 h-6"></Icon>
                    </button>
                </div>
                <!--body-->
                <div class="relative p-6 flex-auto">

                    <div class="flex flex-row align-middle mt-2">

                        <p class="w-8/12 align-middle my-auto font-bold text-md">Upload CSV file</p>


                        <Uploadfile v-model:path="filepath" />
                        {{ filepath }}
                    </div>
                </div>
                <!--footer-->
                <div class="flex items-center justify-center p-6 border-solid border-slate-200 rounded-b">

                    <button @click="generateTestTakers()"
                        class="bg-primary rounded-xl w-5/12 text-white py-3 px-4 text-center" :disabled="isLoading">
                        <div v-if="isLoading">
                            <Icon name="eos-icons:bubble-loading" class="w-6 h-6"></Icon>
                        </div>
                        <div v-else>
                            Add
                        </div>
                    </button>

                </div>
            </div>
        </div>
    </div>
    </div>
    <div v-if="showResetPasswordModal" class="fixed z-[100] inset-0 px-[1em] bg-[#00000076] py-36 h-[100%]">
    <div v-if="showResetPasswordModal"
        class="overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none justify-center items-center flex">
        <div class="relative w-2/6 my-6 mx-auto max-w-10xl">
            <!--content-->
            <div
                class="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <!--header-->
                <div class="flex items-start justify-between p-5 border-solid border-slate-200 rounded-t">
                    <!-- <h3 class="text-3xl font-semibold">
                Modal Title
            </h3> -->
                    <button
                        class="ml-auto text-gray-500 hover:text-black bg-transparent font-bold uppercase text-sm py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button" v-on:click="toggleResetPasswordModal()" :disabled="isLoadingResetPassword">
                        <Icon name="iconoir:cancel" class="w-6 h-6"></Icon>
                    </button>
                </div>
                <!--body-->
                <div class="relative p-6 flex-auto">
                    <div class="align-middle justify-center items-center w-full text-center">
                        <div v-if="isLoadingResetPassword">
                            <p class="text-2xl font-bold">
                                Resetting password
                            </p>
                            <Icon name="eos-icons:bubble-loading" class="w-10 h-10 text-primary m-3"></Icon>
                        </div>
                        <div v-else>
                            <div class="flex flex-row align-middle">
                                <p class="w-8/12 align-middle my-auto font-bold text-lg">New Password</p>
                                <div class="input-group mt-2  w-96">
                                    <input class="form-control bg-slate-100 p-2" id="copyInput" :value="newPassword" />

                                    <button @click="copy()" class="input-group-text">
                                        <Icon v-if="isCopied" name="lucide:copy-check" class="w-6 h-6 text-primary">
                                        </Icon>
                                        <Icon v-else name="lucide:copy" class="w-6 h-6 text-slate-500"></Icon>
                                    </button>

                                </div>

                
                            </div>
                        </div>
                    </div>
                </div>
                <!--footer-->
                <div class="flex items-center justify-center p-6 border-solid border-slate-200 rounded-b">

                </div>
            </div>
        </div>
    </div>
    </div>
    <div v-if="showPracticeModal" class="fixed z-[100] inset-0 px-[1em] bg-[#00000076] py-36 h-[100%]">
    <div v-if="showPracticeModal"
        class="overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none justify-center items-center flex">
        <div class="relative w-2/6 my-6 mx-auto max-w-10xl">
            <!--content-->
            <div
                class="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <!--header-->
                <div class="flex items-start justify-between p-5 border-solid border-slate-200 rounded-t">
                    <!-- <h3 class="text-3xl font-semibold">
                Modal Title
            </h3> -->
                    <button
                        class="ml-auto text-gray-500 hover:text-black bg-transparent font-bold uppercase text-sm py-3 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button" v-on:click="togglePracticeModal()" :disabled="isLoadingPractice">
                        <Icon name="iconoir:cancel" class="w-6 h-6"></Icon>
                    </button>
                </div>
                <!--body-->
                <div class="relative p-6 flex-auto">
                    <div class="align-middle justify-center items-center w-full text-center">
                        <div v-if="isLoadingPractice">
                            <p class="text-2xl font-bold">
                                Publishing Practice Exams
                            </p>
                            <Icon name="eos-icons:bubble-loading" class="w-10 h-10 text-primary m-3"></Icon>
                        </div>
                        <div v-else>
                            <div class="relative p-6 flex-auto">

                                <div class="flex flex-row items-center space-x-4 mx-auto">
                                    <Icon name="ph:warning" class="w-20 h-20 text-red-600"></Icon>
                                    <p class=" font-bold text-lg text-center">Are you sure you want to publish all exams in "{{
                                        examGroup.name }} as practice exams?"</p>
                                </div>
                            </div>
                            <!--footer-->
                            <div
                                class="flex items-center justify-center p-6 border-solid border-slate-200 rounded-b space-x-6">
                                <button @click="togglePracticeModal()"
                                    class="bg-primary rounded-xl w-5/12 text-white py-3 px-4 text-center"
                                    :class="{ 'hidden': isLoading }" :disabled="isLoading">
                                    Cancel
                                </button>

                                <button @click="handlePractice()"
                                    class="bg-primary rounded-xl w-5/12 text-white py-3 px-4 text-center"
                                    :disabled="isLoading">
                                    <div v-if="isLoading ">
                                        <Icon name="eos-icons:bubble-loading" class="w-6 h-6"></Icon>
                                    </div>
                                    <div v-else>
                                        Publish
                                    </div>
                                </button>



                            </div>
                        </div>
                    </div>
                </div>
                <!--footer-->
                <div class="flex items-center justify-center p-6 border-solid border-slate-200 rounded-b">

                </div>
            </div>
        </div>
    </div>
</div>
    <Modal type="error" :show="showErrorModal" :toggle="toggleErrorModal" :message="errorText" />
    <Modal type="success" :show="istestTakerCreated"  message="Test Takers data successfully created!"/>
    
    <Modal type="error" :show="showErrorModal" :toggle="toggleErrorModal" :message="errorText" />
</template>

<script setup lang="ts">

import AdminTopBar from '~~/components/TopBar.vue';
import AdminSideBar from '~~/components/admin/AdminSideBar.vue';

import ExamsList from '~~/components/admin/ExamsList.vue';
import Modal from '@/components/Modal.vue'

definePageMeta({ middleware: 'is-admin' });
const { $client } = useNuxtApp();
const activeTab = ref(1);
const showAddModal = ref(false);
const isLoading = ref(false);
const isReloading = ref(false);
const isLoadingResetPassword = ref(false);
const showResetPasswordModal = ref(false);

const isLoadingPractice = ref(false);
const showPracticeModal = ref(false);
const togglePracticeModal = () => {
    showPracticeModal.value = !showPracticeModal.value;
}
const handlePractice = async () => {
    isLoadingPractice.value = true;
    try {
        const res = await $client.examGroup.publishPractice.mutate({ examGroupId });
        if (res) {
            isReloading.value = true;
            isLoadingPractice.value = false;
            await fetchPracticeData();
            showPracticeModal.value = false;
            isReloading.value = false;
        }
    } catch (e: any) {
        isLoadingPractice.value = false;
        errorText.value = "Failed. Please check your internet and try again later.";
        showErrorModal.value = true;
    }

}

const istestTakerCreated = ref(false);
const errorMessage = ref('');
const filepath = ref('');
const page = ref(1);
const searchText = ref('');

const route = useRoute()
const examGroupId = route.params.id as string;

const searchPage = ref(1);
// get exam group data
const examGroup = await  $client.examGroup.getExamGroup.query({ id: examGroupId });

const {data:practiceData, refresh: fetchPracticeData} = await useAsyncData(() =>  $client.examGroup.getExamGroupPractice.query({examGroupId }));
// get exam data
const isPractice = ref(false);
const publishBtn = ref(false);
if(practiceData.value === 'practice'){
    isPractice.value = true;
}else if(practiceData.value === 'release'){
    publishBtn.value = true;
}else{
    isPractice.value = false;
    publishBtn.value = false;
}

const { data: searchCount, refresh: fetchSearchCount } = await useAsyncData(
    () => $client.examGroup.getTestTakersCount.query(
        { 
            id: examGroupId, 
            search: searchText.value !== '' ? searchText.value : undefined 
        }
        ),
    { watch: [searchPage, searchText] });
const { data: searchTestTakers, refresh: fetchSearchTestTakers, pending: pendingSearch } = await useAsyncData(
    () => $client.examGroup.getExamGroupTestTakers.query(
        { 
            id: examGroupId, 
            search: searchText.value !== '' ? searchText.value : undefined, 
            skip: (searchPage.value - 1) * 6 
        }
            ),
   { watch: [page, searchText] });

const paginateSearch = async (newPage: number) => {
    searchPage.value = newPage;
    isReloading.value = true;

    try {
        await fetchSearchTestTakers();
        await fetchSearchCount();
    } finally {
        isReloading.value = false  
    }
}
const toggleAddModal = () => {

    showAddModal.value = !showAddModal.value;
}
let testTakers: string | any[] = [];

const rows = [['Name', 'Admission Number']]; // add header row


const getTestTakers = async () => {
    testTakers = await $client.examGroup.getExamGroupTestTakers.query({ id: examGroupId });
    if (testTakers) {

        testTakers.forEach((student: { name: string; username: string; }) => {
            rows.push([student.name, student.username]); // add data rows
        });
    }

}

const generateTestTakers = async () => {
   
  isLoading.value = true;

  const inputPath = 'https://ixzzkpsnlfushkyptszh.supabase.co/storage/v1/object/public/eegts-files/' + `${filepath.value}`
  try {
    // const doc = new GoogleSpreadsheet(spreadsheetId);
    
    const testTakersCredentials = await $client.examGroup.generateCredentials.mutate({ examGroupId: examGroupId, inputPath: inputPath});
    

    if (testTakersCredentials) {

        // after   istestTakerCreated is true show success modal then wait 2 seconds then reload window
        istestTakerCreated.value = true;
        setTimeout(() => {
            istestTakerCreated.value = false;
            window.location.reload();
        }, 2000);

    }
    else {
        errorMessage.value = 'Failed to add. Please check your internet and try again later.';

    }
    isLoading.value = false;
    showAddModal.value = false;

  } catch (error: any) {
    isLoading.value = false;
    showAddModal.value = false;
    isReloading.value = true;
     
    errorMessage.value = error.message;
  }

    // Refresh testTakers list after adding pool
    testTakers = await $client.examGroup.getExamGroupTestTakers.query({ id: examGroupId });

    isReloading.value = false;
};

getTestTakers();

const exportData = async()=>{
    try {
    const response = await $client.examGroup.exportGrades.query({ id: examGroupId });
    // const response = await $client.examGroup.exportGrades.query({ id: examGroupId });

    // Create a Blob from the response data
    const blob = new Blob([response], { type: 'text/csv' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grades.csv';

    // Simulate a click to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
    // const blob = new Blob([response], { type: 'text/csv;charset=utf-8' });
    // saveAs(blob, 'grades.csv');
  } catch (error) {
    console.error(error);
  }
}

const exportTableData = async() => {

   try {
    const response = await $client.examGroup.exportTestTakers.query({ id: examGroupId });

    // Create a Blob object from the CSV data
    const blob = new Blob([response], { type: 'text/csv' });

    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test_takers.csv';

    // Simulate a click to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);

  } catch (error: any) {
    errorMessage.value = 'Failed to export.' + error.message;
  
  }
};

const handleDelete = async (id: string) => {
    const response = await $client.examGroup.deleteExamGroup.mutate({ id: id });
    if (response) {
        isReloading.value = true;
    }
}

const exams = await $client.exam.getExamsByExamGroup.query({ skip: 0, id: examGroupId });

const showErrorModal = ref(false);
const errorText = ref('');
const toggleErrorModal = () => {
    showErrorModal.value = !showErrorModal.value;
}
const toggleResetPasswordModal = () => {
    showResetPasswordModal.value = !showResetPasswordModal.value;
}

const ResetPasswordModal = async (contrId: string) => {
    isLoadingResetPassword.value = true;
    showResetPasswordModal.value = !showResetPasswordModal.value;
    try {
        const pass = await $client.testtaker.adminResetPassword.mutate({ id: contrId });
        newPassword.value = pass;
        isLoadingResetPassword.value = false;
    } catch (error) {
        isLoadingResetPassword.value = false;
        errorText.value = "Failed. Please check your internet and try again later.";
        showErrorModal.value = true;
    }
}
const isCopied = ref(false);
const newPassword = ref('');
const copy = () => {
    const copyText = document.getElementById("copyInput") as HTMLInputElement;
    const textToCopy = copyText.value;

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            isCopied.value = true;
            setTimeout(() => {
                isCopied.value = false;
            }, 3000);
        })
        .catch((error) => {
            console.error('Failed to copy text:', error);
        });
}


</script>
<style scoped>
.middle {
    margin-left: 13vmax;
}
.w-full.overflow-y-auto {
  height: calc(100vh - 4rem - 3.5rem); /* Adjust the height according to your needs */
}
</style>